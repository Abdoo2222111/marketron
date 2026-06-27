const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:MOwOtARokmDGhiccJwmiOoQFFrXnEmDf@reseau.proxy.rlwy.net:24425/evolution_db'
  });

  try {
    const res = await pool.query('SELECT current_database(), current_user');
    console.log('Connected:', res.rows[0]);

    await pool.query('GRANT ALL ON SCHEMA public TO postgres');
    await pool.query('GRANT ALL ON DATABASE evolution_db TO postgres');
    console.log('Grants completed');

    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error:', err.message);
  }

  await pool.end();
}

main();