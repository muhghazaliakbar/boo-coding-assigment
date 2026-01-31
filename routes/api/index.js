'use strict';

const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const profilesRouter = require('./profiles');

router.use('/users', usersRouter);
router.use('/profiles', profilesRouter);

module.exports = router;
