'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { insertEvent, fetchEvents } = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HONEYPOT_TOKEN = process.env.HONEYPOT_TOKEN || 'REPLACE_WITH_TOKEN';

// view setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Simple request logger that stores everything except dashboard when token is present
app.use((req, res, next) => {
  // do not log legitimate dashboard views with token
  if (req.path === '/dashboard' && req.query && req.query.token === HONEYPOT_TOKEN) return next();

  const ev = {
    ts: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
    method: req.method,
    path: req.originalUrl || req.url,
    query: req.query,
    headers: req.headers,
    body: (req.body && Object.keys(req.body).length) ? JSON.stringify(req.body) : ''
  };
  insertEvent(ev);
  // fall through — present a believable response depending on route
  next();
});

// Fake admin/login pages to lure automated scans
const fakeLoginForm = `
  <html><head><meta charset="utf-8"><title>Login</title></head>
  <body>
    <h2>Sign In</h2>
    <form method="POST">
      <label>Username: <input name="username" /></label><br/>
      <label>Password: <input type="password" name="password" /></label><br/>
      <button type="submit">Login</button>
    </form>
  </body></html>
`;

app.get(['/admin', '/login', '/wp-admin', '/phpmyadmin', '/administrator'], (req, res) => {
  res.set('Server', 'Apache/2.4.1 (Unix)');
  res.send(fakeLoginForm);
});

app.post(['/admin', '/login', '/wp-admin', '/phpmyadmin', '/administrator'], (req, res) => {
  // We capture posted credentials via middleware; respond with generic failure
  res.status(401).send(`<html><body><h3>Invalid credentials</h3></body></html>`);
});

// Generic catch-all that looks like a generic web server
app.get('/', (req, res) => {
  res.send('<html><body><h1>Welcome</h1><p>Nothing to see here.</p></body></html>');
});

// Dashboard to inspect captured events (protected by token)
app.get('/dashboard', (req, res) => {
  if (req.query.token !== HONEYPOT_TOKEN) return res.status(403).send('Forbidden');
  fetchEvents(500, (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.render('dashboard', { events: rows });
  });
});

// lightweight health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Honeypot listening on http://0.0.0.0:${PORT} — dashboard token: ${HONEYPOT_TOKEN}`);
});
