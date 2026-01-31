'use strict';

const mongoose = require('mongoose');

function isValidObjectId(id) {
  if (id == null || id === '') return false;
  try {
    return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
  } catch {
    return false;
  }
}

function trimOrNull(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

module.exports = { isValidObjectId, trimOrNull };
