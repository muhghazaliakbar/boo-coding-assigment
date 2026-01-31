'use strict';

const mongoose = require('mongoose');

const DEFAULT_IMAGE = '/static/space.png';

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  mbti: { type: String, required: true },
  enneagram: { type: String, required: true },
  variant: { type: String, required: true },
  tritype: { type: Number, required: true },
  socionics: { type: String, required: true },
  sloan: { type: String, required: true },
  psyche: { type: String, required: true },
  temperaments: { type: String, default: '' },
  image: { type: String, default: DEFAULT_IMAGE },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = { Profile, DEFAULT_IMAGE };
