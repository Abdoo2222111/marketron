import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

let accessToken = '';

const TEST_USER = {
  name: 'اختبار AI',
  email: `ai_test_${Date.now()}@marketron.io`,
  password: 'Test@123456',
};

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(TEST_USER);
  accessToken = res.body.data?.accessToken || '';
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  await prisma.$disconnect();
});

describe('AI API', () => {
  test('GET /api/v1/ai/providers - list providers', async () => {
    const res = await request(app)
      .get('/api/v1/ai/providers')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('POST /api/v1/ai/generate-text - generate ad text', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate-text')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ prompt: 'منتج جديد للتجميل', platform: 'instagram' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('POST /api/v1/ai/generate-image - generate image prompt', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate-image')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ prompt: 'صورة لمنتج تجميل', style: 'luxury' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('POST /api/v1/ai/recommend - get recommendations', async () => {
    const res = await request(app)
      .post('/api/v1/ai/recommend')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ platform: 'facebook' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('POST /api/v1/ai/why-not-selling - market analysis', async () => {
    const res = await request(app)
      .post('/api/v1/ai/why-not-selling')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ product: 'منتج تجميل', country: 'السعودية' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.keyFindings).toBeDefined();
    expect(res.body.data.recommendations).toBeDefined();
  });

  test('GET /api/v1/ai/history - get generation history', async () => {
    const res = await request(app)
      .get('/api/v1/ai/history')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
