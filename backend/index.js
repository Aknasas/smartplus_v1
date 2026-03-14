// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const metricRoutes = require('./routes/metrics');
const anomalyRoutes = require('./routes/anomalies');
const emergencyRoutes = require('./routes/emergency');
const reminderRoutes = require('./routes/reminders');
const targetRoutes = require('./routes/targets');
const systemRoutes = require('./routes/system');

const app = express();
const PORT = process.env.PORT || 4100;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== DATABASE INIT ====================
async function initDB() {
  const client = await pool.connect();
  try {
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log('Available tables:', tables.rows.map(t => t.table_name).join(', '));

    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Total users in database: ${userCount.rows[0].count}`);

  } catch (err) {
    console.error('DB Init error:', err.message);
  } finally {
    client.release();
  }
}

// ==================== ROUTES ====================
// IMPORTANT: Mount auth routes FIRST
app.use('/api/users', authRoutes);        // Auth routes (register, login, verify, forgot-password, reset-password)
app.use('/api/users', userRoutes);        // User management routes
app.use('/api', metricRoutes);             // Metrics routes
app.use('/api', anomalyRoutes);            // Anomalies routes
app.use('/api', emergencyRoutes);          // Emergency contacts routes
app.use('/api', reminderRoutes);           // Reminders routes
app.use('/api', targetRoutes);             // Health targets routes
app.use('/', systemRoutes);                // System routes (health, test-db, etc.)

// Log all registered routes for debugging
console.log('\n=== Registered Routes ===');
const listRoutes = (stack, basePath = '') => {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      listRoutes(layer.handle.stack, basePath + (layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/')));
    }
  });
};
listRoutes(app._router.stack);
console.log('=======================\n');

// ==================== START SERVER ====================
async function startServer() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully!');
    client.release();

    await initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(60));
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log('Available endpoints:');
      console.log('   POST /api/users/register        - Register new user');
      console.log('   POST /api/users/login           - User login');
      console.log('   POST /api/users/forgot-password - Request password reset');
      console.log('   POST /api/users/reset-password  - Reset password with token');
      console.log('   GET  /api/users/verify          - Verify token');
      console.log('   GET  /api/users                  - Get all users');
      console.log('   GET  /api/users/:userId          - Get user by ID');
      console.log('   GET  /api/users/:userId/metrics  - Get user metrics');
      console.log('   GET  /api/users/:userId/anomalies - Get user anomalies');
      console.log('   GET  /health                    - Health check');
      console.log('='.repeat(60));
      console.log('Test users (password: password123):');
      console.log('   john_doe, jane_smith, bob_wilson, dr_silva');
      console.log('='.repeat(60));
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    console.log('\n Starting server in LIMITED mode (database unavailable)');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`  Server running in LIMITED mode on http://localhost:${PORT}`);
      console.log('   Database is not available. Some features will not work.');
    });
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing connections...');
  await pool.end();
  process.exit(0);
});