import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { FacebookIntegration } from '../src/facebook/index';
import { tokenManager } from '../src/utils/tokenManager';

describe('Facebook Integration', () => {
  let facebook: FacebookIntegration;
  let mock: MockAdapter;
  const testAccountId = '123456789';
  const testToken = 'test-facebook-token-ea-test';

  beforeEach(() => {
    // Initialize Facebook integration with test config
    facebook = new FacebookIntegration(testToken);
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
    sinon.restore();
  });

  describe('OAuth Flow', () => {
    it('should generate a valid auth URL', async () => {
      const authUrl = await facebook.getAuthUrl('https://example.com/callback');
      expect(authUrl).to.include('facebook.com');
      expect(authUrl).to.include('v20.0');
      expect(authUrl).to.include('redirect_uri=https://example.com/callback');
      expect(authUrl).to.include('ads_management');
      expect(authUrl).to.include('ads_read');
    });

    it('should handle OAuth callback successfully', async () => {
      // Mock token exchange
      mock.onGet(/\/oauth\/access_token/).reply(200, {
        access_token: 'short-lived-token',
        token_type: 'bearer',
        expires_in: 7200,
      });

      // Mock long-lived token exchange
      mock.onGet(/\/oauth\/access_token.*grant_type=fb_exchange_token/).reply(200, {
        access_token: 'long-lived-token',
        token_type: 'bearer',
        expires_in: 5184000,
      });

      // Mock user info
      mock.onGet(/\/me\?fields=id,name,email/).reply(200, {
        id: '12345',
        name: 'Test User',
        email: 'test@example.com',
      });

      const result = await facebook.handleCallback('test-auth-code', 'https://example.com/callback');
      expect(result).to.have.property('accessToken');
      expect(result.accessToken).to.equal('long-lived-token');
    });

    it('should handle OAuth callback error', async () => {
      mock.onGet(/\/oauth\/access_token/).reply(400, {
        error: { message: 'Invalid code', code: 100 },
      });

      try {
        await facebook.handleCallback('invalid-code', 'https://example.com/callback');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).to.include('فشل');
      }
    });
  });

  describe('Campaign Management', () => {
    it('should get campaigns list', async () => {
      const mockCampaigns = {
        data: [
          { id: '111', name: 'Campaign 1', status: 'ACTIVE', objective: 'CONVERSIONS', daily_budget: 5000, currency: 'USD', created_time: '2024-01-01T00:00:00+0000', updated_time: '2024-01-02T00:00:00+0000' },
          { id: '222', name: 'Campaign 2', status: 'PAUSED', objective: 'REACH', lifetime_budget: 10000, currency: 'USD', created_time: '2024-01-03T00:00:00+0000', updated_time: '2024-01-04T00:00:00+0000' },
        ],
        paging: { cursors: { before: 'before_cursor', after: 'after_cursor' } },
      };

      mock.onGet(/\/act_\d+\/campaigns/).reply(200, mockCampaigns);

      const campaigns = await facebook.getCampaigns(testAccountId);
      expect(campaigns).to.have.lengthOf(2);
      expect(campaigns[0]).to.include({
        id: '111',
        name: 'Campaign 1',
        status: 'ACTIVE',
        platform: 'facebook',
      });
    });

    it('should create a campaign', async () => {
      const mockCreateResponse = { id: '333' };

      mock.onPost(/\/act_\d+\/campaigns/).reply(200, mockCreateResponse);
      mock.onGet(/\/333\?fields/).reply(200, {
        id: '333', name: 'New Campaign', status: 'ACTIVE', objective: 'CONVERSIONS',
        daily_budget: 5000, currency: 'USD',
        created_time: '2024-01-05T00:00:00+0000', updated_time: '2024-01-05T00:00:00+0000',
      });

      const campaign = await facebook.createCampaign({
        name: 'New Campaign',
        objective: 'CONVERSIONS',
        status: 'ACTIVE',
        dailyBudget: 5000,
      });

      expect(campaign).to.have.property('id', '333');
      expect(campaign).to.have.property('name', 'New Campaign');
    });

    it('should update a campaign', async () => {
      mock.onPost(/\/222/).reply(200, { success: true });

      const updated = await facebook.updateCampaign('222', {
        name: 'Updated Campaign',
        status: 'ACTIVE',
      });

      expect(updated).to.exist;
    });

    it('should delete a campaign', async () => {
      mock.onPost(/\/222/).reply(200, { success: true });

      await facebook.deleteCampaign('222');
      // Should not throw
    });
  });

  describe('Insights', () => {
    it('should get campaign insights', async () => {
      const mockInsights = {
        data: [{
          impressions: '10000',
          reach: '8000',
          frequency: '1.25',
          clicks: '500',
          ctr: '5.00',
          cpc: '0.50',
          cpm: '10.00',
          spend: '5000',
          actions: [{ action_type: 'purchase', value: '50' }, { action_type: 'add_to_cart', value: '100' }],
          date_start: '2024-01-01',
          date_stop: '2024-01-07',
        }],
      };

      mock.onGet(/\/111\/insights/).reply(200, mockInsights);

      const insights = await facebook.getCampaignInsights(
        '111',
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        'DAY'
      );

      expect(insights).to.have.property('impressions', 10000);
      expect(insights).to.have.property('clicks', 500);
      expect(insights).to.have.property('ctr', 5.00);
      expect(insights).to.have.property('conversions', 50);
    });
  });

  describe('Token Management', () => {
    it('should refresh an expired token', async () => {
      sinon.stub(tokenManager, 'getTokens').returns({
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() - 3600000,
        tokenType: 'bearer',
        scopes: [],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      });

      mock.onGet(/\/oauth\/access_token.*grant_type=fb_exchange_token/).reply(200, {
        access_token: 'new-token',
        token_type: 'bearer',
        expires_in: 5184000,
      });

      const newToken = await facebook.refreshToken('refresh-token');
      expect(newToken).to.have.property('accessToken', 'new-token');
    });
  });
});
