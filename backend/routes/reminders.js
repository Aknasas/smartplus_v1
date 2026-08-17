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
             recurrence_interval, is_active, is_completed, completed_at,
             alarm_enabled, created_at
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

// Create new reminder
router.post('/users/:userId/reminders', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      reminder_type,
      title,
      description,
      scheduled_datetime,
      end_datetime,
      extra_info,
      color,
      is_recurring,
      recurrence_pattern,
      recurrence_interval,
      alarm_enabled = true
    } = req.body;

    const query = `
      INSERT INTO reminders (
        patient_id, reminder_type, title, description, scheduled_datetime,
        end_datetime, extra_info, color, is_recurring, recurrence_pattern,
        recurrence_interval, alarm_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      reminder_type,
      title,
      description,
      scheduled_datetime,
      end_datetime,
      extra_info,
      color,
      is_recurring || false,
      recurrence_pattern,
      recurrence_interval,
      alarm_enabled
    ]);

    res.status(201).json({
      success: true,
      reminder: result.rows[0]
    });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update reminder
router.put('/reminders/:reminderId', authenticateToken, async (req, res) => {
  try {
    const { reminderId } = req.params;
    const {
      reminder_type,
      title,
      description,
      scheduled_datetime,
      end_datetime,
      extra_info,
      color,
      is_recurring,
      recurrence_pattern,
      recurrence_interval,
      is_active,
      is_completed,
      alarm_enabled
    } = req.body;

    const query = `
      UPDATE reminders
      SET reminder_type = COALESCE($1, reminder_type),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          scheduled_datetime = COALESCE($4, scheduled_datetime),
          end_datetime = COALESCE($5, end_datetime),
          extra_info = COALESCE($6, extra_info),
          color = COALESCE($7, color),
          is_recurring = COALESCE($8, is_recurring),
          recurrence_pattern = COALESCE($9, recurrence_pattern),
          recurrence_interval = COALESCE($10, recurrence_interval),
          is_active = COALESCE($11, is_active),
          is_completed = COALESCE($12, is_completed),
          alarm_enabled = COALESCE($13, alarm_enabled),
          updated_at = CURRENT_TIMESTAMP,
          completed_at = CASE
            WHEN $12 = true AND is_completed = false THEN CURRENT_TIMESTAMP
            ELSE completed_at
          END
      WHERE reminder_id = $14
      RETURNING *
    `;

    const result = await pool.query(query, [
      reminder_type,
      title,
      description,
      scheduled_datetime,
      end_datetime,
      extra_info,
      color,
      is_recurring,
      recurrence_pattern,
      recurrence_interval,
      is_active,
      is_completed,
      alarm_enabled,
      reminderId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({
      success: true,
      reminder: result.rows[0]
    });
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete reminder
router.delete('/reminders/:reminderId', authenticateToken, async (req, res) => {
  try {
    const { reminderId } = req.params;

    const query = 'DELETE FROM reminders WHERE reminder_id = $1 RETURNING *';
    const result = await pool.query(query, [reminderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Complete reminder (snooze/dismiss alarm)
router.patch('/reminders/:reminderId/complete', authenticateToken, async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { completed = true, snooze_minutes = null } = req.body;

    if (snooze_minutes) {
      // Snooze: update scheduled time
      const query = `
        UPDATE reminders
        SET scheduled_datetime = CURRENT_TIMESTAMP + ($1 || ' minutes')::INTERVAL,
            updated_at = CURRENT_TIMESTAMP
        WHERE reminder_id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [snooze_minutes, reminderId]);

      res.json({
        success: true,
        reminder: result.rows[0],
        snoozed: true
      });
    } else {
      // Complete reminder
      const query = `
        UPDATE reminders
        SET is_completed = $1,
            completed_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
            updated_at = CURRENT_TIMESTAMP
        WHERE reminder_id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [completed, reminderId]);

      res.json({
        success: true,
        reminder: result.rows[0]
      });
    }
  } catch (err) {
    console.error('Complete reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;