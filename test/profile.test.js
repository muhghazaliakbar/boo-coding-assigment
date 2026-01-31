'use strict';

const request = require('supertest');

const db = require('../db');
const profileRoutes = require('../routes/profile');
const app = require('../app');
const { Profile, DEFAULT_IMAGE } = require('../models/Profile');

describe('Profile routes', () => {
  beforeAll(async () => {
    await db.connect();
    await profileRoutes.seedDefault();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('GET / redirects to first profile id', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/[a-f0-9]{24}$/);
  });

  it('GET /:id returns 200 and profile HTML when profile exists', async () => {
    const first = await Profile.findOne().sort({ createdAt: 1 });
    expect(first).toBeTruthy();
    const res = await request(app).get(`/${first._id}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('A Martinez');
    expect(res.text).toContain('ISFJ');
    expect(res.text).toContain(DEFAULT_IMAGE);
  });

  it('GET /:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/invalid-id');
    expect(res.status).toBe(404);
    expect(res.text).toBe('Profile not found.');
  });

  it('GET /:id returns 404 for non-existent valid ObjectId', async () => {
    const res = await request(app).get('/000000000000000000000000');
    expect(res.status).toBe(404);
    expect(res.text).toBe('Profile not found.');
  });

  it('POST / creates profile and returns 201 with same image for all', async () => {
    const body = {
      name: 'Test Profile',
      description: 'Test description.',
      mbti: 'INTJ',
      enneagram: '5w4',
      variant: 'sp/sx',
      tritype: 513,
      socionics: 'ILI',
      sloan: 'RCUEI',
      psyche: 'VLEF',
      temperaments: 'Phlegmatic',
    };
    const res = await request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send(body);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(body.name);
    expect(res.body.description).toBe(body.description);
    expect(res.body.mbti).toBe(body.mbti);
    expect(res.body.image).toBe(DEFAULT_IMAGE);
    expect(res.body.id).toBeDefined();
    expect(res.body.id).toMatch(/^[a-f0-9]{24}$/);
  });

  it('GET /:id returns created profile after POST', async () => {
    const body = {
      name: 'View Test Profile',
      description: 'For view test.',
      mbti: 'ENFP',
      enneagram: '7w6',
      variant: 'so/sx',
      tritype: 729,
      socionics: 'IEE',
      sloan: 'SCUAN',
      psyche: 'EVFL',
    };
    const createRes = await request(app).post('/').set('Content-Type', 'application/json').send(body);
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;
    const viewRes = await request(app).get(`/${id}`);
    expect(viewRes.status).toBe(200);
    expect(viewRes.text).toContain('View Test Profile');
    expect(viewRes.text).toContain('ENFP');
  });

  it('GET / returns 404 when no profiles exist', async () => {
    await Profile.deleteMany({});
    const res = await request(app).get('/');
    expect(res.status).toBe(404);
    expect(res.text).toBe('No profiles found.');
  });
});
