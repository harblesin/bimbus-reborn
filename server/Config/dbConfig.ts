import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const { DATABASE, PGUSER, PGPASSWORD, PGHOST, PGPORT } = process.env;
const db: any = new Pool({
  user: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  port: Number(PGPORT),
  database: DATABASE,
});

const createDbConnection = async () => {
  await db.connect(async (err: Error) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`);
    } else {
      console.log(`Database connection established`);
    }
  });
}

createDbConnection();

export default db;
