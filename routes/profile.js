'use strict';

const express = require('express');
const router = express.Router();
const { Profile, DEFAULT_IMAGE } = require('../models/Profile');
const { isValidObjectId } = require('../lib/utils');

const DEFAULT_PROFILE = {
  name: 'A Martinez',
  description: 'Adolph Larrue Martinez III.',
  mbti: 'ISFJ',
  enneagram: '9w3',
  variant: 'sp/so',
  tritype: 725,
  socionics: 'SEE',
  sloan: 'RCOEN',
  psyche: 'FEVL',
  temperaments: '',
  image: DEFAULT_IMAGE,
};

function profileToView(profile) {
  const doc = profile.toJSON ? profile.toJSON() : profile;
  return {
    id: doc.id || doc._id?.toString(),
    name: doc.name,
    description: doc.description,
    mbti: doc.mbti,
    enneagram: doc.enneagram,
    variant: doc.variant,
    tritype: doc.tritype,
    socionics: doc.socionics,
    sloan: doc.sloan,
    psyche: doc.psyche,
    temperaments: doc.temperaments ?? '',
    image: doc.image || DEFAULT_IMAGE,
  };
}

module.exports = function () {
  router.get('/', async function (req, res, next) {
    try {
      const first = await Profile.findOne().sort({ createdAt: 1 });
      if (!first) {
        return res.status(404).send('No profiles found.');
      }
      res.redirect(302, `/${first._id}`);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async function (req, res, next) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).send('Profile not found.');
    }
    try {
      const profile = await Profile.findById(id);
      if (!profile) {
        return res.status(404).send('Profile not found.');
      }
      res.render('profile_template', {
        profile: profileToView(profile),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async function (req, res, next) {
    const body = req.body || {};
    const profile = new Profile({
      name: body.name ?? '',
      description: body.description ?? '',
      mbti: body.mbti ?? '',
      enneagram: body.enneagram ?? '',
      variant: body.variant ?? '',
      tritype: Number(body.tritype) || 0,
      socionics: body.socionics ?? '',
      sloan: body.sloan ?? '',
      psyche: body.psyche ?? '',
      temperaments: body.temperaments ?? '',
      image: DEFAULT_IMAGE,
    });
    try {
      await profile.save();
      res.status(201).json(profileToView(profile));
    } catch (err) {
      next(err);
    }
  });

  return router;
};

module.exports.seedDefault = async function () {
  const count = await Profile.countDocuments();
  if (count === 0) {
    await Profile.create(DEFAULT_PROFILE);
  }
};
