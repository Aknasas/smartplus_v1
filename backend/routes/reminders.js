// backend/routes/reminders.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user's reminders
router.get('/users/:userId/reminders', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { active_only = true, upcoming = false } = req.query;

    let query = `
      SELECT reminder_id, reminder_type, title, description, scheduled_datetime,
             end_datetime, extra_info, color, is_recurring, recurrence_pattern,
             recurrence_interval, is_active, is_completed, completed_at, created_at
      FROM reminders
      WHERE patient_id = $1
    `;

    const params = [userId];
    let paramCounter = 2;

    if (active_only === 'true') {
      query += ` AND is_active = true AND is_completed = false`;
    }

    if (upcoming === 'true') {
      query += ` AND scheduled_datetime > NOW()`;
    }

    query += ` ORDER BY scheduled_datetime`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      reminders: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;