const pg = require("pg");

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  min: 1,
  max: 5,
  ssl: { rejectUnauthorized: false },
});

let client;

pool.connect().then((c) => {
  client = c;

  console.log("Connected to database");
});

const query = async (q, values) => {
  console.log(`Postgres Query: ${q} Params: ${values.join(",")}`);

  try {
    await client.query("BEGIN");
    const res = await client.query(q, values);
    await client.query("COMMIT");

    return res;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
};

module.exports = { query };
