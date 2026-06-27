import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

let accessToken = '';
let campaignId = '';

const TEST_USER = {
  name: 'اختبار الحملات',
  email: `campaigns_test_${Date.now()}@marketron.io`,
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

describe('Campaigns API', () => {
  test('POST /api/v1/campaigns - create a campaign', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'حملة اختبار',
        platform: 'facebook',
        objective: 'awareness',
        budget: 5000,
        startDate: new Date().toISOString(),
        targetAudience: { country: 'السعودية', ageMin: 18, ageMax: 45 },
        content: { primaryText: 'نص الإعلان', headline: 'عنوان', cta: 'تسوق الآن' },
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data?.id).toBeDefined();
    campaignId = res.body.data.id;
  });

  test('GET /api/v1/campaigns - list campaigns', async () => {
    const res = await request(app)
      .get('/api/v1/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/campaigns/stats - get campaign stats', async () => {
    const res = await request(app)
      .get('/api/v1/campaigns/stats')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('GET /api/v1/campaigns/:id - get campaign by id', async () => {
    const res = await request(app)
      .get(`/api/v1/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(campaignId);
  });

  test('PUT /api/v1/campaigns/:id - update campaign', async () => {
    const res = await request(app)
      .put(`/api/v1/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'حملة محدثة' })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/campaigns/:id/pause - pause campaign', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${campaignId}/pause`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/campaigns/:id/activate - activate campaign', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${campaignId}/activate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('GET /api/v1/campaigns/:id/insights - get campaign insights', async () => {
    const res = await request(app)
      .get(`/api/v1/campaigns/${campaignId}/insights`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/v1/campaigns/:id - delete campaign', async () => {
    const res = await request(app)
      .delete(`/api/v1/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
