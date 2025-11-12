const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { init } = require('./db');

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
      return res.status(200).json({ account_id });
    } catch (err) {
      console.error('create-account error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const { account_id } = req.body || {};
      if (!account_id) {
        return res.status(400).json({ error: 'account_id_required' });
      }
      const row = await db.get('SELECT account_id FROM accounts WHERE account_id = ?', account_id);
      if (!row) {
        return res.status(404).json({ error: 'account_not_found' });
      }

      const token = jwt.sign({ account_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.status(200).json({ token, expires_in: JWT_EXPIRES_IN });
    } catch (err) {
      console.error('login error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  });

  app.get('/whoami', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing_token' });
    }
    const token = auth.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return res.json({ ok: true, payload });
    } catch (err) {
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
