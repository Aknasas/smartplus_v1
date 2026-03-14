// backend/routes/system.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Health check
router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    mode: process.env.RUNNING_IN_DOCKER === 'true' ? 'docker' : 'local',
    database: 'checking'
  };

  try {
    await pool.query('SELECT 1');
    health.database = 'connected';

    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM doctors) as doctors,
        (SELECT COUNT(*) FROM ambulance_services) as ambulances
    `);

    health.counts = counts.rows[0];
  } catch (err) {
    health.database = 'disconnected';
    health.error = err.message;
  }

  res.json(health);
});

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    res.json({
      success: true,
      message: 'Database connected',
      time: result.rows[0].time,
      version: result.rows[0].version
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// Get database info
router.get('/db-info', async (req, res) => {
  try {
    const tables = await pool.query(`
      SELECT
        table_name,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
        (SELECT count(*) FROM information_schema.table_constraints WHERE table_name = t.table_name) as constraint_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM doctors) as doctors,
        (SELECT COUNT(*) FROM ambulance_services) as ambulances,
        (SELECT COUNT(*) FROM health_metrics) as health_metrics,
        (SELECT COUNT(*) FROM anomalies) as anomalies,
        (SELECT COUNT(*) FROM emergency_alerts) as emergency_alerts,
        (SELECT COUNT(*) FROM reminders) as reminders
    `);

    res.json({
      success: true,
      database: pool.database,
      tables: tables.rows,
      counts: counts.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Create sample users (for testing)
router.get('/create-sample-users', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bcrypt = require('bcrypt');

    const sampleUsers = [
      ['john_doe', 'john.doe@email.com', 'John', 'Doe', 'patient', '1990-01-15'],
      ['jane_smith', 'jane.smith@email.com', 'Jane', 'Smith', 'patient', '1992-05-22'],
      ['bob_wilson', 'bob.wilson@email.com', 'Bob', 'Wilson', 'patient', '1985-11-10'],
      ['dr_silva', 'dr.silva@hospital.lk', 'Kamal', 'Silva', 'doctor', '1975-03-20']
    ];

    const results = [];

    for (const [username, email, first_name, last_name, role, dob] of sampleUsers) {
      const existing = await client.query(
        'SELECT user_id FROM users WHERE username = $1',
        [username]
      );

      if (existing.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const userResult = await client.query(
          `INSERT INTO users (username, password, email, role, first_name, last_name, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           RETURNING user_id`,
          [username, hashedPassword, email, role, first_name, last_name]
        );

        const userId = userResult.rows[0].user_id;

        if (role === 'patient') {
          await client.query(
            `INSERT INTO patients (patient_id, date_of_birth, registration_completed, registration_date)
             VALUES ($1, $2, true, CURRENT_TIMESTAMP)`,
            [userId, dob]
          );
        } else if (role === 'doctor') {
          await client.query(
            `INSERT INTO doctors (doctor_id, specialization, license_number, hospital)
             VALUES ($1, 'General Practitioner', 'LIC' || substr(md5(random()::text), 1, 6), 'General Hospital')`,
            [userId]
          );
        }

        results.push({ username, status: 'created' });
      } else {
        results.push({ username, status: 'already exists' });
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Sample users processed',
      results
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create sample users error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;