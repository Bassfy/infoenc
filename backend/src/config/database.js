const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('[DB] Connected to PostgreSQL successfully');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    console.warn('[DB] Running without database — using mock data');
  }
}

module.exports = { pool, testConnection };
