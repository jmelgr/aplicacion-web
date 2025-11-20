const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const cloudwatch = new AWS.CloudWatch();

async function sendMetric(metricName, value = 1, unit = 'Count') {
  const params = {
    Namespace: process.env.CW_METRIC_NAMESPACE || 'AuthService',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit
      }
    ]
  };

  try {
    await cloudwatch.putMetricData(params).promise();
  } catch (err) {
    console.error(`Error enviando métrica ${metricName}:`, err.message);
  }
}

module.exports = { sendMetric };
