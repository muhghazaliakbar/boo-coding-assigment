'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '', trim: true },
  mbti: { type: String, default: null },
  enneagram: { type: String, default: null },
  zodiac: { type: String, default: null },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      ret.likeCount = (ret.likedBy && ret.likedBy.length) || 0;
      delete ret._id;
      delete ret.__v;
      delete ret.likedBy;
      return ret;
    },
  },
});

commentSchema.virtual('likeCount').get(function () {
  return (this.likedBy && this.likedBy.length) || 0;
});

commentSchema.index({ profileId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };
