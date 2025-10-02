const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucket = process.env.S3_BUCKET;
  try {
    for (const record of event.Records) {
      const { uuid } = JSON.parse(record.body);
      await s3.deleteObject({ Bucket: bucket, Key: uuid }).promise();
      console.log(`Archivo ${uuid} eliminado de S3.`);
    }
    return { statusCode: 200, body: "Procesado correctamente" };
  } catch (err) {
    console.error("Error Lambda deleteFromS3:", err);
    return { statusCode: 500, body: err.message };
  }
};

