// backend/routes/metrics.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user's health metrics
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
      query += ` AND metric_type = $${paramCounter++}`;
      params.push(metric_type);
    }

    if (days) {
      query += ` AND time > NOW() - INTERVAL '$${paramCounter++} days'`;
      params.push(days);
    }

    query += ` ORDER BY time DESC LIMIT $${paramCounter}`;
    params.push(parseInt(limit));

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

// Add health metric
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patient_id, metric_type, value, unit, device_id, finger_detected, notes } = req.body;

    if (!patient_id || !metric_type || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO health_metrics (patient_id, metric_type, value, unit, device_id, finger_detected, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING metric_id, time, metric_type, value, unit`,
      [patient_id, metric_type, value, unit, device_id, finger_detected, notes]
    );

    // Check for anomalies
    let anomaly = null;
    if (metric_type === 'heart_rate' && (value < 50 || value > 120)) {
      anomaly = await pool.query(
        `INSERT INTO anomalies (patient_id, metric_type, metric_value, expected_range_min, expected_range_max, severity, level)
         VALUES ($1, $2, $3, 50, 120,
           CASE WHEN $3 < 50 OR $3 > 120 THEN 'medium' ELSE 'low' END,
           CASE WHEN $3 > 120 THEN 'Critical' ELSE 'Warning' END)
         RETURNING anomaly_id`,
        [patient_id, metric_type, value]
      );
    } else if (metric_type === 'spo2' && value < 95) {
      anomaly = await pool.query(
        `INSERT INTO anomalies (patient_id, metric_type, metric_value, expected_range_min, expected_range_max, severity, level)
         VALUES ($1, $2, $3, 95, 100, 'high', 'Critical')
         RETURNING anomaly_id`,
        [patient_id, metric_type, value]
      );
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

module.exports = router;