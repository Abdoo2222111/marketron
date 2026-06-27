import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

let accessToken = '';

const TEST_USER = {
  name: 'اختبار تحليلات',
  email: `analytics_test_${Date.now()}@marketron.io`,
  password: 'Test@123456',
};

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(TEST_USER);

  accessToken = res.body.data?.accessToken || '';

  // Seed demo data synchronously via the demo endpoint
  if (accessToken) {
    await request(app)
      .post('/api/v1/demo/seed')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
  }
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  await prisma.$disconnect();
});

describe('Analytics API', () => {
  test('GET /api/v1/analytics/overview - get overview', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    // Should have totals even if zero
    expect(res.body.data.totals).toBeDefined();
  });

  test('GET /api/v1/campaigns/stats - campaign stats', async () => {
    const res = await request(app)
      .get('/api/v1/campaigns/stats')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
