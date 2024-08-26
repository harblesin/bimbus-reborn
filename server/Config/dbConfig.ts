const pg = require('pg');
const { Client } = pg;
const { DATABASE, PGUSER, PGPASSWORD, PGHOST, PGPORT } = process.env;

const db = new Client({
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