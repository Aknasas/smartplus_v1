// backend/index.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== CONFIGURATION ====================
const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

const dbConfig = {
  host: isDocker ? 'postgres' : 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'healthdb',
  user: process.env.DB_USER || 'healthuser',
  password: process.env.DB_PASSWORD || 'healthpass123',
  connectionTimeoutMillis: 5000
};

const PORT = process.env.PORT || 4100;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('Starting Health Monitoring Backend');
console.log(`Mode: ${isDocker ? 'DOCKER' : 'LOCAL'}`);
console.log(`🗄Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
console.log(`User: ${dbConfig.user}`);

const pool = new Pool(dbConfig);

// ==================== DATABASE INIT ====================
async function initDB() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ready');

    // Check if we have users
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('Creating sample users...');
      const sampleUsers = [
        ['john_doe', 'john@example.com', 'John Doe', 'patient'],
        ['jane_smith', 'jane@example.com', 'Jane Smith', 'patient'],
        ['dr_silva', 'dr.silva@hospital.com', 'Dr. Silva', 'doctor']
      ];

      for (const [username, email, name, role] of sampleUsers) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await client.query(
          `INSERT INTO users (username, password, email, name, role)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (username) DO NOTHING`,
          [username, hashedPassword, email, name, role]
        );
      }
      console.log('Sample users created (password: password123)');
    }
  } catch (err) {
    console.error('DB Init error:', err.message);
  } finally {
    client.release();
  }
}

// ==================== AUTH MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ==================== ROUTES ====================

// Health check
app.get('/health', async (req, res) => {
  const health = { status: 'OK', timestamp: new Date().toISOString(), mode: isDocker ? 'docker' : 'local' };
  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (err) {
    health.database = 'disconnected';
    health.error = err.message;
  }
  res.json(health);
});

// Register
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password, email, name, role = 'patient' } = req.body;
    if (!username || !password || !email || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password, email, name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, username, email, name, role`,
      [username, hashedPassword, email, name, role]
    );

    const token = jwt.sign(
      { user_id: result.rows[0].user_id, username, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'SELECT user_id, username, password, email, name, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== START SERVER ====================
async function startServer() {
  try {
    const client = await pool.connect();
    console.log('Database connected!');
    client.release();
    await initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(50));
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('='.repeat(50));
      console.log('Test users:');
      console.log('   john_doe / password123');
      console.log('   jane_smith / password123');
      console.log('   dr_silva / password123');
      console.log('='.repeat(50));
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in LIMITED mode on http://localhost:${PORT}`);
    });
  }
}

startServer();