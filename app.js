'use strict';

const express = require('express');
const path = require('path');
const db = require('./db');
const profileRoutes = require('./routes/profile');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', require('./routes/api'));
app.use('/', profileRoutes());

async function start() {
  await db.connect();
  await profileRoutes.seedDefault();
  app.listen(port, () => {
    console.log('Express started. Listening on %s', port);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

module.exports = app;
