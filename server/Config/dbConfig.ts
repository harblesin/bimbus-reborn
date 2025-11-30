// server/Config/dbConfig.ts
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const { DATABASE, PGUSER, PGPASSWORD, PGHOST, PGPORT } = process.env;

export const pool = new Pool({
  user: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  port: Number(PGPORT),
  database: DATABASE,
});

// Optional: log a simple connection test
(async () => {
  const now = new Date();
  try {
    const client = await pool.connect();
    console.info(
      `${
        process.pid
      } | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Database | Connection established`
    );
    client.release();
  } catch (err) {
    console.info(
      `${
        process.pid
      } | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Database | Error connecting to database: ${err}`
    );
  }
})();

export default pool;
