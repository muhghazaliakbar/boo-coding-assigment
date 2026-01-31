'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({ mergeParams: true });
const { Profile } = require('../../models/Profile');
const { User } = require('../../models/User');
const { Comment } = require('../../models/Comment');
const { Vote } = require('../../models/Vote');
const { isValidMbti, isValidEnneagram, isValidZodiac } = require('../../lib/personalityOptions');
const { isValidObjectId, trimOrNull } = require('../../lib/utils');

async function requireProfile(req, res, next) {
  const profileId = req.params.profileId;
  if (!isValidObjectId(profileId)) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  req.profile = profile;
  next();
}

// --- Comments ---

router.post('/:profileId/comments', requireProfile, async function (req, res, next) {
  const profileId = req.profile._id;
  const { userId, title, body, mbti, enneagram, zodiac } = req.body || {};
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'userId is required and must be a valid id' });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  const titleStr = (title ?? '').trim();
  if (!titleStr) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (mbti != null && mbti !== '' && !isValidMbti(mbti)) {
    return res.status(400).json({ error: 'invalid mbti value' });
  }
  if (enneagram != null && enneagram !== '' && !isValidEnneagram(enneagram)) {
    return res.status(400).json({ error: 'invalid enneagram value' });
  }
  if (zodiac != null && zodiac !== '' && !isValidZodiac(zodiac)) {
    return res.status(400).json({ error: 'invalid zodiac value' });
  }
  try {
    const comment = await Comment.create({
      profileId,
      userId,
      title: titleStr,
      body: (body ?? '').trim(),
      mbti: trimOrNull(mbti),
      enneagram: trimOrNull(enneagram),
      zodiac: trimOrNull(zodiac),
    });
    const out = comment.toJSON();
    out.user = { id: user._id.toString(), name: user.name };
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
});

router.get('/:profileId/comments', requireProfile, async function (req, res, next) {
  const profileId = req.profile._id;
  const sort = (req.query.sort || 'best').toLowerCase();
  const filter = (req.query.filter || 'all').toLowerCase();
  const validSort = ['best', 'recent'].includes(sort) ? sort : 'best';
  const validFilter = ['all', 'mbti', 'enneagram', 'zodiac'].includes(filter) ? filter : 'all';

  const match = { profileId };
  if (validFilter === 'mbti') match.mbti = { $nin: [null, ''] };
  if (validFilter === 'enneagram') match.enneagram = { $nin: [null, ''] };
  if (validFilter === 'zodiac') match.zodiac = { $nin: [null, ''] };

  try {
    const sortStage = validSort === 'recent'
      ? { $sort: { createdAt: -1 } }
      : { $sort: { likeCount: -1, createdAt: -1 } };
    const pipeline = [
      { $match: match },
      { $addFields: { likeCount: { $size: { $ifNull: ['$likedBy', []] } } } },
      sortStage,
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDoc' } },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
    ];
    const comments = await Comment.aggregate(pipeline);
    const list = comments.map((c) => {
      const userDoc = c.userDoc || {};
      return {
        id: c._id.toString(),
        profileId: c.profileId.toString(),
        userId: c.userId ? c.userId.toString() : null,
        user: userDoc._id ? { id: userDoc._id.toString(), name: userDoc.name || '' } : { id: '', name: '' },
        title: c.title,
        body: c.body || '',
        mbti: c.mbti || null,
        enneagram: c.enneagram || null,
        zodiac: c.zodiac || null,
        likeCount: (c.likeCount != null ? c.likeCount : (c.likedBy && c.likedBy.length)) || 0,
        createdAt: c.createdAt,
      };
    });
    res.json({ comments: list });
  } catch (err) {
    next(err);
  }
});

router.post('/:profileId/comments/:commentId/like', requireProfile, async function (req, res, next) {
  const { commentId } = req.params;
  const userId = (req.body && req.body.userId) || req.query.userId;
  if (!isValidObjectId(commentId) || !isValidObjectId(userId)) {
    return res.status(400).json({ error: 'commentId and userId are required' });
  }
  try {
    const comment = await Comment.findOne({ _id: commentId, profileId: req.profile._id });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    if (comment.likedBy.some((id) => id.equals(uid))) {
      return res.json(comment.toJSON());
    }
    comment.likedBy.push(uid);
    await comment.save();
    res.json(comment.toJSON());
  } catch (err) {
    next(err);
  }
});

router.delete('/:profileId/comments/:commentId/like', requireProfile, async function (req, res, next) {
  const { commentId } = req.params;
  const userId = (req.body && req.body.userId) || req.query.userId;
  if (!isValidObjectId(commentId) || !isValidObjectId(userId)) {
    return res.status(400).json({ error: 'commentId and userId are required' });
  }
  try {
    const comment = await Comment.findOne({ _id: commentId, profileId: req.profile._id });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    comment.likedBy = comment.likedBy.filter((id) => !id.equals(uid));
    await comment.save();
    res.json(comment.toJSON());
  } catch (err) {
    next(err);
  }
});

// --- Votes ---

router.post('/:profileId/votes', requireProfile, async function (req, res, next) {
  const profileId = req.profile._id;
  const { userId, mbti, enneagram, zodiac } = req.body || {};
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'userId is required and must be a valid id' });
  }
  if (mbti != null && mbti !== '' && !isValidMbti(mbti)) {
    return res.status(400).json({ error: 'invalid mbti value' });
  }
  if (enneagram != null && enneagram !== '' && !isValidEnneagram(enneagram)) {
    return res.status(400).json({ error: 'invalid enneagram value' });
  }
  if (zodiac != null && zodiac !== '' && !isValidZodiac(zodiac)) {
    return res.status(400).json({ error: 'invalid zodiac value' });
  }
  try {
    const update = {
      mbti: trimOrNull(mbti),
      enneagram: trimOrNull(enneagram),
      zodiac: trimOrNull(zodiac),
    };
    const vote = await Vote.findOneAndUpdate(
      { profileId, userId },
      update,
      { new: true, upsert: true, runValidators: false }
    );
    res.json(vote.toJSON());
  } catch (err) {
    next(err);
  }
});

router.get('/:profileId/votes/me', requireProfile, async function (req, res, next) {
  const profileId = req.profile._id;
  const userId = req.query.userId;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'userId query is required' });
  }
  try {
    const vote = await Vote.findOne({ profileId, userId });
    if (!vote) {
      return res.json({ mbti: null, enneagram: null, zodiac: null });
    }
    res.json({
      mbti: vote.mbti || null,
      enneagram: vote.enneagram || null,
      zodiac: vote.zodiac || null,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:profileId/votes', requireProfile, async function (req, res, next) {
  const profileId = req.profile._id;
  try {
    const votes = await Vote.find({ profileId }).lean();
    const mbtiCounts = {};
    const enneagramCounts = {};
    const zodiacCounts = {};
    for (const v of votes) {
      if (v.mbti) mbtiCounts[v.mbti] = (mbtiCounts[v.mbti] || 0) + 1;
      if (v.enneagram) enneagramCounts[v.enneagram] = (enneagramCounts[v.enneagram] || 0) + 1;
      if (v.zodiac) zodiacCounts[v.zodiac] = (zodiacCounts[v.zodiac] || 0) + 1;
    }
    const top = (counts) => {
      const entries = Object.entries(counts);
      if (entries.length === 0) return null;
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    };
    res.json({
      mbti: top(mbtiCounts),
      enneagram: top(enneagramCounts),
      zodiac: top(zodiacCounts),
      counts: { mbti: mbtiCounts, enneagram: enneagramCounts, zodiac: zodiacCounts },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
