import pg from 'pg';

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create a function that mimics the Neon API
const sql = async (strings, ...values) => {
  // Handle template literal usage
  if (typeof strings === 'string') {
    // Direct query string
    const result = await pool.query(strings);
    return result.rows;
  }
  
  // Template literal usage
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : '');
  }, '');
  
  const result = await pool.query(query, values);
  return result.rows;
};

// Add transaction support
sql.transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(sql);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default sql;