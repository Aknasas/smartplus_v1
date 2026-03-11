// backend/test-minimal.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 4100;

console.log('🔧 Configuration:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[MISSING]');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (err) {
    res.json({
      status: 'ok',
      database: 'disconnected',
      error: err.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});