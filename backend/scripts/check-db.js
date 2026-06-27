const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:MOwOtARokmDGhiccJwmiOoQFFrXnEmDf@reseau.proxy.rlwy.net:24425/evolution_db'
  });

  try {
    const tables = await pool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = $2',
      ['public', 'BASE TABLE']
    );
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const hasPrisma = await pool.query(
      'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)',
      ['_prisma_migrations']
    );
    console.log('Has prisma_migrations:', hasPrisma.rows[0].exists);
  } catch (err) {
    console.error('Error:', err.message);
  }

  await pool.end();
}

main();
