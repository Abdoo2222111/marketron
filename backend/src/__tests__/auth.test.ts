import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

const TEST_USER = {
  name: 'مستخدم اختبار',
  email: `test_${Date.now()}@marketron.io`,
  password: 'Test@123456',
  company: 'شركة اختبار',
};

let accessToken = '';

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  await prisma.$disconnect();
});

describe('Auth API', () => {
  test('POST /api/v1/auth/register - should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  test('POST /api/v1/auth/register - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login - should login successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  test('POST /api/v1/auth/login - should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'wrong' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/auth/me - should return user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(TEST_USER.email);
  });

  test('GET /api/v1/auth/me - should reject without token', async () => {
    await request(app)
      .get('/api/v1/auth/me')
      .expect(401);
  });

  test('GET /api/v1/health - should return health status', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeDefined();
  });
});
