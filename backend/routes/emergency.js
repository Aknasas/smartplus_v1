// backend/routes/emergency.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user's emergency contacts
router.get('/users/:userId/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT contact_id, name, relationship, phone, alternate_phone, email, is_primary, can_receive_alerts
       FROM emergency_contacts
       WHERE patient_id = $1
       ORDER BY is_primary DESC, name`,
      [userId]
    );

    res.json({
      success: true,
      contacts: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Get emergency contacts error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;