require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const sqlPath = path.join(__dirname, 'supabase_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('supabase_schema.sql not found');
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.error('Please set DATABASE_URL (Supabase Postgres connection string) in .env');
    process.exit(1);
  }

  // Some managed Postgres (Supabase) requires SSL and may block unverified certs.
  // Enable SSL with `rejectUnauthorized: false` for the migration runner so it can connect
  // using the provided DATABASE_URL. For production, prefer proper CA verification.
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to Postgres, running migration...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', err.message || err);
    if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
      console.error('\nPossible causes: network blocked, invalid host, or malformed DATABASE_URL.');
      console.error('If your password contains special characters (eg. @, : or /) you must URL-encode them.');
      console.error('Example replacement: replace @ with %40 inside the connection string.');
    }
  } finally {
    await client.end();
  }
}

run();
