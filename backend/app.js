import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Pool } from "pg";
import AWS from "aws-sdk";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

// -----------------------------
// Configuración Postgres
// -----------------------------
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});


// -----------------------------
// Configuración AWS
// -----------------------------
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const sqs = new AWS.SQS();

// -----------------------------
// Configuración Multer (memoria)
// -----------------------------
const upload = multer({ storage: multer.memoryStorage() });

// -----------------------------
// Endpoint salud
// -----------------------------
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// -----------------------------
// Subir archivo
// -----------------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Archivo no recibido" });

  const fileUUID = uuidv4(); // Aquí está el UUID que es único para cada archivo
  const s3Key = fileUUID;

  try {
    // Subir archivo a S3
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }).promise();

    // Insertar registro en RDS
    await pool.query(
      "INSERT INTO public.files(id, s3_key, status) VALUES($1, $2, 'pendiente')",
      [fileUUID, s3Key]
    );

    // Enviar mensaje a SQS (para activar Lambda)
    await sqs.sendMessage({
      QueueUrl: process.env.SQS_QUEUE,
      MessageBody: JSON.stringify({ uuid: fileUUID }),
    }).promise();

    // Responder al usuario con info del archivo
    res.json({
      message: "Archivo subido con éxito",
      filename: fileUUID,
      originalName: req.file.originalname,
      url: `/uploads/${fileUUID}`
    });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({ message: "Error al subir archivo", error: err.message });
  }
});

// -----------------------------
// Descargar archivo
// -----------------------------
app.get("/uploads/:uuid", async (req, res) => {
  const { uuid } = req.params;

  try {
    // Generar URL pre-firmada de S3
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET,
      Key: uuid,
      Expires: 60,
    });

    // Enviar mensaje a SQS para que Lambda lo marque como usado o elimine
    await sqs.sendMessage({
      QueueUrl: process.env.SQS_QUEUE,
      MessageBody: JSON.stringify({ uuid }),
    }).promise();

    res.redirect(url);
  } catch (err) {
    console.error("Error al obtener archivo:", err);
    res.status(500).json({ message: "Error al obtener archivo" });
  }
});

// -----------------------------
// Servidor backend
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
