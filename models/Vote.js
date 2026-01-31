'use strict';

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mbti: { type: String, default: null },
  enneagram: { type: String, default: null },
  zodiac: { type: String, default: null },
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

voteSchema.index({ profileId: 1, userId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = { Vote };
