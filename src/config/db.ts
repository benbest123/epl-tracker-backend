import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000, // if a connection is idle for 30 seconds, it will be closed
  connectionTimeoutMillis: 5000, // if a query waits more than 5 seconds for a connection, it will timeoutW
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err: Error) => {
  console.error("❌ Unexpected DB error:", err.message);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export const getClient = () => pool.connect();

export default pool;
