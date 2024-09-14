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
  const now = new Date();
  await db.connect(async (err: Error) => {
    if (err) {
      console.info(`${process.pid} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Database | Error connecting to database: ${err}`);
    } else {
      console.info(`${process.pid} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Database | Connection established`);
    }
  });
}

const getDb = () => {
  return db;
}


createDbConnection();

export default db;
export { getDb };
