// Con este archivo estoy realizando las pruebas de los lambdas (aún estoy resolviendo el problema que estoy teniendo con los lambdas)

import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Conectado! Hora del servidor:", res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error("Error de conexión:", err);
  }
}

testConnection();
