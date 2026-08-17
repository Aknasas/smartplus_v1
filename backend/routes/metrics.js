// backend/routes/metrics.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user's health metrics - FIXED parameter typing
router.get('/users/:userId/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { metric_type, limit = 100, days } = req.query;

    let query = `
      SELECT metric_id, time, metric_type, value, unit, device_id, finger_detected, notes
      FROM health_metrics
      WHERE patient_id = $1
    `;

    const params = [userId];
    let paramCounter = 2;

    if (metric_type) {
      query += ` AND metric_type = $${paramCounter}`;
      params.push(metric_type);
      paramCounter++;
    }

    if (days) {
      // FIXED: Proper interval syntax with parameter
      const daysNum = parseInt(days);
      if (!isNaN(daysNum) && daysNum > 0) {
        query += ` AND time > NOW() - INTERVAL '1 day' * $${paramCounter}`;
        params.push(daysNum);
        paramCounter++;
      }
    }

    const limitNum = parseInt(limit);
    query += ` ORDER BY time DESC LIMIT $${paramCounter}`;
    params.push(limitNum);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      metrics: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Get metrics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add health metric - FIXED error handling
router.post('/metrics', authenticateToken, async (req, res) => {
  try {
    console.log('📥 POST /metrics - Body:', req.body);

    const { patient_id, metric_type, value, unit, device_id, finger_detected, notes } = req.body;

    // Validate required fields
    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }
    if (!metric_type) {
      return res.status(400).json({ error: 'metric_type is required' });
    }
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'value is required' });
    }

    // Validate value is a number
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return res.status(400).json({ error: 'value must be a number' });
    }

    const result = await pool.query(
      `INSERT INTO health_metrics (patient_id, metric_type, value, unit, device_id, finger_detected, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING metric_id, time, metric_type, value, unit`,
      [patient_id, metric_type, numericValue, unit || null, device_id || null, finger_detected || false, notes || null]
    );

    // Check for anomalies
    let anomaly = null;
    if (metric_type === 'heart_rate') {
      if (numericValue < 50 || numericValue > 120) {
        anomaly = await pool.query(
          `INSERT INTO anomalies (patient_id, metric_type, metric_value, expected_range_min, expected_range_max, severity, level)
           VALUES ($1, $2, $3, 50, 120, 'medium', 'Warning')
           RETURNING anomaly_id`,
          [patient_id, metric_type, numericValue]
        );
      }
    } else if (metric_type === 'spo2') {
      if (numericValue < 95) {
        anomaly = await pool.query(
          `INSERT INTO anomalies (patient_id, metric_type, metric_value, expected_range_min, expected_range_max, severity, level)
           VALUES ($1, $2, $3, 95, 100, 'high', 'Critical')
           RETURNING anomaly_id`,
          [patient_id, metric_type, numericValue]
        );
      }
    } else if (metric_type === 'temperature') {
      if (numericValue < 35 || numericValue > 39) {
        anomaly = await pool.query(
          `INSERT INTO anomalies (patient_id, metric_type, metric_value, expected_range_min, expected_range_max, severity, level)
           VALUES ($1, $2, $3, 35, 39, 'medium', 'Warning')
           RETURNING anomaly_id`,
          [patient_id, metric_type, numericValue]
        );
      }
    }

    res.status(201).json({
      success: true,
      metric: result.rows[0],
      anomaly_detected: !!anomaly,
      anomaly_id: anomaly?.rows[0]?.anomaly_id
    });

  } catch (err) {
    console.error('Add metric error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get anomalies for a user
router.get('/users/:userId/anomalies', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { resolved, limit = 50 } = req.query;

    let query = `
      SELECT anomaly_id, detected_at, metric_type, metric_value,
             expected_range_min, expected_range_max, severity, level, is_resolved, notes
      FROM anomalies
      WHERE patient_id = $1
    `;

    const params = [userId];
    let paramCounter = 2;

    if (resolved !== undefined) {
      query += ` AND is_resolved = $${paramCounter}`;
      params.push(resolved === 'true');
      paramCounter++;
    }

    const limitNum = parseInt(limit);
    query += ` ORDER BY detected_at DESC LIMIT $${paramCounter}`;
    params.push(limitNum);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      anomalies: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Get anomalies error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific anomaly by ID
router.get('/anomalies/:anomalyId', authenticateToken, async (req, res) => {
  try {
    const { anomalyId } = req.params;

    const result = await pool.query(
      `SELECT anomaly_id, detected_at, metric_type, metric_value,
              expected_range_min, expected_range_max, severity, level, is_resolved, notes
       FROM anomalies
       WHERE anomaly_id = $1`,
      [anomalyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({
      success: true,
      anomaly: result.rows[0]
    });
  } catch (err) {
    console.error('Get anomaly error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update anomaly resolution status
router.patch('/anomalies/:anomalyId', authenticateToken, async (req, res) => {
  try {
    const { anomalyId } = req.params;
    const { is_resolved, notes } = req.body;

    const result = await pool.query(
      `UPDATE anomalies
       SET is_resolved = COALESCE($1, is_resolved),
           notes = COALESCE($2, notes)
       WHERE anomaly_id = $3
       RETURNING anomaly_id, is_resolved, notes`,
      [is_resolved, notes, anomalyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({
      success: true,
      anomaly: result.rows[0]
    });
  } catch (err) {
    console.error('Update anomaly error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;