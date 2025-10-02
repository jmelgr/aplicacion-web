const { Client } = require("pg");
const AWS = require("aws-sdk");

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
});

const sqs = new AWS.SQS();

exports.handler = async (event) => {
  try {
    await client.connect();
    for (const record of event.Records) {
      const { uuid } = JSON.parse(record.body);
      await client.query("UPDATE files SET status='usado' WHERE id=$1", [uuid]);
      console.log(`Archivo ${uuid} marcado como usado.`);
    }
    await client.end();
    return { statusCode: 200, body: "Procesado correctamente" };
  } catch (err) {
    console.error("Error Lambda markUsed:", err);
    return { statusCode: 500, body: err.message };
  }
};

