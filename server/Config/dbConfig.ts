import { Client as pgClient } from 'pg';
const { DATABASE, PGUSER, PGPASSWORD, PGHOST, PGPORT } = process.env;

const db: any = new pgClient({
  user: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  port: PGPORT,
  database: DATABASE,
});

const connectToDb = async () => {
  await db.connect();
}

connectToDb();

module.exports = db;