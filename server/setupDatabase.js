import pool from "./db.js";

async function setupDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        fulfilment TEXT NOT NULL,
        collection_date DATE NOT NULL,
        collection_time TEXT NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Orders table created successfully.");
  } catch (error) {
    console.error("Database setup error:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();