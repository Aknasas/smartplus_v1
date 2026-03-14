// backend/routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.user_id, u.username, u.email, u.role, u.first_name, u.last_name,
        u.is_active, u.created_at, u.last_login,
        p.patient_id, p.blood_type, p.city
       FROM users u
       LEFT JOIN patients p ON u.user_id = p.patient_id
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
        u.user_id, u.username, u.email, u.role, u.first_name, u.last_name,
        u.is_active, u.created_at, u.last_login, u.phone, u.profile_image_url,
        p.date_of_birth, p.gender, p.blood_type, p.height_cm, p.weight_kg,
        p.address, p.city, p.medical_conditions, p.allergies, p.current_medications,
        p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relationship
       FROM users u
       LEFT JOIN patients p ON u.user_id = p.patient_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:userId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { userId } = req.params;
    const updates = req.body;

    const userCheck = await client.query(
      'SELECT role FROM users WHERE user_id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = userCheck.rows[0].role;

    // Update users table
    const userFields = [];
    const userValues = [];
    let paramCounter = 1;

    if (updates.first_name) {
      userFields.push(`first_name = $${paramCounter++}`);
      userValues.push(updates.first_name);
    }
    if (updates.last_name) {
      userFields.push(`last_name = $${paramCounter++}`);
      userValues.push(updates.last_name);
    }
    if (updates.phone) {
      userFields.push(`phone = $${paramCounter++}`);
      userValues.push(updates.phone);
    }
    if (updates.email) {
      userFields.push(`email = $${paramCounter++}`);
      userValues.push(updates.email);
    }

    if (userFields.length > 0) {
      userValues.push(userId);
      await client.query(
        `UPDATE users SET ${userFields.join(', ')} WHERE user_id = $${paramCounter}`,
        userValues
      );
    }

    // If patient, update patients table
    if (userRole === 'patient') {
      const patientFields = [];
      const patientValues = [];
      let patientParamCounter = 1;

      const patientUpdates = [
        'date_of_birth', 'gender', 'blood_type', 'height_cm', 'weight_kg',
        'address', 'city', 'medical_conditions', 'allergies', 'current_medications',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'
      ];

      patientUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          patientFields.push(`${field} = $${patientParamCounter++}`);
          patientValues.push(updates[field]);
        }
      });

      if (patientFields.length > 0) {
        const patientExists = await client.query(
          'SELECT patient_id FROM patients WHERE patient_id = $1',
          [userId]
        );

        if (patientExists.rows.length > 0) {
          patientValues.push(userId);
          await client.query(
            `UPDATE patients SET ${patientFields.join(', ')} WHERE patient_id = $${patientParamCounter}`,
            patientValues
          );
        } else {
          patientValues.push(userId);
          await client.query(
            `INSERT INTO patients (patient_id, ${patientFields.map(f => f.split(' ')[0]).join(', ')})
             VALUES ($${patientParamCounter}, ${patientValues.slice(0, -1).map((_, i) => '$' + (i+1)).join(', ')})`,
            patientValues
          );
        }
      }
    }

    await client.query('COMMIT');

    const updatedUser = await client.query(
      `SELECT
        u.user_id, u.username, u.email, u.role, u.first_name, u.last_name,
        u.phone, u.is_active,
        p.date_of_birth, p.gender, p.blood_type, p.height_cm, p.weight_kg,
        p.address, p.city, p.medical_conditions, p.allergies, p.current_medications,
        p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relationship
       FROM users u
       LEFT JOIN patients p ON u.user_id = p.patient_id
       WHERE u.user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;