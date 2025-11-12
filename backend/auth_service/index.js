const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { init } = require('./db');
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const cloudwatchlogs = new AWS.CloudWatchLogs();

const LOG_GROUP = process.env.CW_LOG_GROUP || 'AuthServiceLogs';
const LOG_STREAM = process.env.CW_LOG_STREAM || 'BackendStream';
let sequenceToken = null;

// Envía logs a CloudWatch
async function sendToCloudWatch(message) {
  try {
    const params = {
      logEvents: [
        {
          message: typeof message === 'string' ? message : JSON.stringify(message),
          timestamp: Date.now(),
        },
      ],
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      sequenceToken,
    };

    const res = await cloudwatchlogs.putLogEvents(params).promise();
    sequenceToken = res.nextSequenceToken;
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') {
      await createLogGroupAndStream();
      return sendToCloudWatch(message);
    } else if (err.code === 'InvalidSequenceTokenException') {
      sequenceToken = err.message.match(/sequenceToken is: ([A-Za-z0-9]+)/)?.[1];
      return sendToCloudWatch(message);
    } else {
      console.error('Error enviando a CloudWatch:', err.message);
    }
  }
}

async function createLogGroupAndStream() {
  try {
    await cloudwatchlogs.createLogGroup({ logGroupName: LOG_GROUP }).promise();
  } catch (e) {
    if (e.code !== 'ResourceAlreadyExistsException') console.error(e);
  }
  try {
    await cloudwatchlogs.createLogStream({ logGroupName: LOG_GROUP, logStreamName: LOG_STREAM }).promise();
  } catch (e) {
    if (e.code !== 'ResourceAlreadyExistsException') console.error(e);
  }
}

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function main() {
  const db = await init();
  const app = express();

  app.use(cors({ origin: 'http://localhost:3000' }));

  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    res.json({ ok: true, service: 'auth-service', env: process.env.NODE_ENV || 'development' });
  });

  app.post('/create-account', async (req, res) => {
    try {
      const account_id = uuidv4();
      await db.run('INSERT INTO accounts (account_id) VALUES (?)', account_id);

      const log = `[${new Date().toISOString()}] Cuenta creada: ${account_id}`;
      console.log(log);
      await sendToCloudWatch(log);

      return res.status(200).json({ account_id });
    } catch (err) {
      const log = `[${new Date().toISOString()}] create-account error: ${err.message}`;
      console.error(log);
      await sendToCloudWatch(log);
      return res.status(500).json({ error: 'internal_error' });
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const { account_id } = req.body || {};
      if (!account_id) {
        const log = `[${new Date().toISOString()}] /login error: account_id requerido`;
        console.warn(log);
        await sendToCloudWatch(log);
        return res.status(400).json({ error: 'account_id_required' });
      }

      const row = await db.get('SELECT account_id FROM accounts WHERE account_id = ?', account_id);
      if (!row) {
        const log = `[${new Date().toISOString()}] /login error: cuenta no encontrada (${account_id})`;
        console.warn(log);
        await sendToCloudWatch(log);
        return res.status(404).json({ error: 'account_not_found' });
      }

      const token = jwt.sign({ account_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      const log = `[${new Date().toISOString()}] /login correcto para cuenta ${account_id}`;
      console.log(log);
      await sendToCloudWatch(log);

      return res.status(200).json({ token, expires_in: JWT_EXPIRES_IN });
    } catch (err) {
      const log = `[${new Date().toISOString()}] /login error interno: ${err.message}`;
      console.error(log);
      await sendToCloudWatch(log);
      return res.status(500).json({ error: 'internal_error' });
    }
  });

  app.get('/whoami', async (req, res) => {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
      const log = `[${new Date().toISOString()}] /whoami error: token ausente`;
      console.warn(log);
      await sendToCloudWatch(log);
      return res.status(401).json({ error: 'missing_token' });
    }

    const token = auth.slice('Bearer '.length);

    try {
      const payload = jwt.verify(token, JWT_SECRET);

      const log = `[${new Date().toISOString()}] /whoami éxito: ${JSON.stringify(payload)}`;
      console.log(log);
      await sendToCloudWatch(log);

      return res.json({ ok: true, payload });
    } catch (err) {
      const log = `[${new Date().toISOString()}] /whoami token inválido: ${err.message}`;
      console.warn(log);
      await sendToCloudWatch(log);
      return res.status(401).json({ error: 'invalid_token', message: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Auth service listening on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Fatal error starting service', err);
  process.exit(1);
});
