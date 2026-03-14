// backend/routes/targets.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user's health targets
router.get('/users/:userId/targets', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT target_id, target_type, target_value, target_min_value, target_max_value,
              current_value, unit, icon, color, is_active, start_date, end_date
       FROM health_targets
       WHERE patient_id = $1 AND is_active = true
       ORDER BY target_type`,
      [userId]
    );

    res.json({
      success: true,
      targets: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Get targets error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;