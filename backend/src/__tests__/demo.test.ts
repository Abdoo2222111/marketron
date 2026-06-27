import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

let accessToken = '';

const TEST_USER = {
  name: 'اختبار ديمو',
  email: `demo_test_${Date.now()}@marketron.io`,
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

describe('Demo Data API', () => {
  test('POST /api/v1/demo/seed - seed demo data', async () => {
    const res = await request(app)
      .post('/api/v1/demo/seed')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.created).toBe(true);
  });

  test('POST /api/v1/demo/seed - prevent duplicate seeding', async () => {
    const res = await request(app)
      .post('/api/v1/demo/seed')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.created).toBe(false);
  });

  test('Seed data creates campaigns', async () => {
    const res = await request(app)
      .get('/api/v1/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Seed data creates AI agents', async () => {
    const res = await request(app)
      .get('/api/v1/ai-agents')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
