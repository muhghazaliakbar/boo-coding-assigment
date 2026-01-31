'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../../models/User');
const { isValidObjectId } = require('../../lib/utils');

router.post('/', async function (req, res, next) {
  const name = (req.body && req.body.name != null ? String(req.body.name) : '').trim();
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const user = await User.create({ name });
    res.status(201).json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async function (req, res, next) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ error: 'User not found' });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
