'use strict';

const request = require('supertest');

const db = require('../db');
const profileRoutes = require('../routes/profile');
const app = require('../app');
const { Profile } = require('../models/Profile');
const { User } = require('../models/User');

describe('API', () => {
  let profileId;
  let userId;

  beforeAll(async () => {
    await db.connect();
    await profileRoutes.seedDefault();
    const profile = await Profile.findOne();
    profileId = profile._id.toString();
    const user = await User.create({ name: 'Test User' });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('Users', () => {
    it('POST /api/users creates user with name', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({ name: 'Alice' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Alice');
      expect(res.body.id).toBeDefined();
    });

    it('GET /api/users/:id returns user', async () => {
      const res = await request(app).get(`/api/users/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test User');
      expect(res.body.id).toBe(userId);
    });

    it('POST /api/users returns 400 when name missing', async () => {
      const res = await request(app).post('/api/users').set('Content-Type', 'application/json').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('Comments', () => {
    let commentId;

    it('POST /api/profiles/:profileId/comments creates comment', async () => {
      const res = await request(app)
        .post(`/api/profiles/${profileId}/comments`)
        .set('Content-Type', 'application/json')
        .send({
          userId,
          title: 'He is INTP',
          body: 'I think so.',
          mbti: 'INTP',
          enneagram: '5w4',
          zodiac: 'Cancer',
        });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('He is INTP');
      expect(res.body.body).toBe('I think so.');
      expect(res.body.mbti).toBe('INTP');
      expect(res.body.enneagram).toBe('5w4');
      expect(res.body.zodiac).toBe('Cancer');
      expect(res.body.likeCount).toBe(0);
      commentId = res.body.id;
    });

    it('GET /api/profiles/:profileId/comments returns list with sort and filter', async () => {
      const res = await request(app).get(`/api/profiles/${profileId}/comments?sort=recent&filter=all`);
      expect(res.status).toBe(200);
      expect(res.body.comments).toBeDefined();
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
      const c = res.body.comments.find((x) => x.id === commentId);
      expect(c).toBeDefined();
      expect(c.user.name).toBe('Test User');
    });

    it('POST /api/profiles/:profileId/comments/:commentId/like adds like', async () => {
      const res = await request(app)
        .post(`/api/profiles/${profileId}/comments/${commentId}/like`)
        .set('Content-Type', 'application/json')
        .send({ userId });
      expect(res.status).toBe(200);
      expect(res.body.likeCount).toBe(1);
    });

    it('DELETE /api/profiles/:profileId/comments/:commentId/like removes like', async () => {
      const res = await request(app)
        .delete(`/api/profiles/${profileId}/comments/${commentId}/like`)
        .send({ userId });
      expect(res.status).toBe(200);
      expect(res.body.likeCount).toBe(0);
    });

    it('POST comment returns 400 for invalid personality value', async () => {
      const res = await request(app)
        .post(`/api/profiles/${profileId}/comments`)
        .set('Content-Type', 'application/json')
        .send({ userId, title: 'Bad', mbti: 'INVALID' });
      expect(res.status).toBe(400);
    });
  });

  describe('Votes', () => {
    it('POST /api/profiles/:profileId/votes upserts vote', async () => {
      const res = await request(app)
        .post(`/api/profiles/${profileId}/votes`)
        .set('Content-Type', 'application/json')
        .send({ userId, mbti: 'INTP', enneagram: '5w4', zodiac: 'Cancer' });
      expect(res.status).toBe(200);
      expect(res.body.mbti).toBe('INTP');
      expect(res.body.enneagram).toBe('5w4');
      expect(res.body.zodiac).toBe('Cancer');
    });

    it('GET /api/profiles/:profileId/votes returns aggregated counts', async () => {
      const res = await request(app).get(`/api/profiles/${profileId}/votes`);
      expect(res.status).toBe(200);
      expect(res.body.mbti).toBeDefined();
      expect(res.body.enneagram).toBeDefined();
      expect(res.body.zodiac).toBeDefined();
      expect(res.body.counts).toBeDefined();
      expect(res.body.counts.mbti).toBeDefined();
    });

    it('GET /api/profiles/:profileId/votes/me returns user vote', async () => {
      const res = await request(app).get(`/api/profiles/${profileId}/votes/me?userId=${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.mbti).toBe('INTP');
      expect(res.body.enneagram).toBe('5w4');
      expect(res.body.zodiac).toBe('Cancer');
    });

    it('POST vote with partial fields (optional voting)', async () => {
      const u = await User.create({ name: 'Voter Two' });
      const res = await request(app)
        .post(`/api/profiles/${profileId}/votes`)
        .set('Content-Type', 'application/json')
        .send({ userId: u._id.toString(), mbti: 'INTJ' });
      expect(res.status).toBe(200);
      expect(res.body.mbti).toBe('INTJ');
      expect(res.body.enneagram).toBeNull();
      expect(res.body.zodiac).toBeNull();
    });
  });

  describe('404 handling', () => {
    it('GET comments for non-existent profile returns 404', async () => {
      const res = await request(app).get('/api/profiles/000000000000000000000000/comments');
      expect(res.status).toBe(404);
    });

    it('POST like with invalid commentId returns 404', async () => {
      const res = await request(app)
        .post(`/api/profiles/${profileId}/comments/000000000000000000000000/like`)
        .send({ userId });
      expect(res.status).toBe(404);
    });
  });
});
