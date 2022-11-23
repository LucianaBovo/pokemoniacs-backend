const pg = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } })

const query = async (q, values) => {
  const client = await pool.connect();
  let res;
  try {
    await client.query('BEGIN');
    try {
      res = await client.query(q, values);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
  }
  return res;
}

module.exports = { query };