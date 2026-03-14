// backend/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

const dbConfig = {
  host: isDocker ? 'postgres' : 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'healthdb',
  user: process.env.DB_USER || 'healthuser',
  password: process.env.DB_PASSWORD || 'healthpass123',
  connectionTimeoutMillis: 5000
};

console.log('🗄 Database Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user
});

const pool = new Pool(dbConfig);

module.exports = pool;