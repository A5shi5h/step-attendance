const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'workshop_attendance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 Running database setup...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Schema applied');

    // Seed default admin
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@Workshop2026';
    const hash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      [username, hash]
    );
    console.log(`✅ Admin user ensured: ${username}`);
    console.log('🚀 Database setup complete');
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, setupDatabase };
