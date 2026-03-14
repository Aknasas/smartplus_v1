// backend/routes/anomalies.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user's anomalies
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
      query += ` AND is_resolved = $${paramCounter++}`;
      params.push(resolved === 'true');
    }

    query += ` ORDER BY detected_at DESC LIMIT $${paramCounter}`;
    params.push(parseInt(limit));

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

module.exports = router;