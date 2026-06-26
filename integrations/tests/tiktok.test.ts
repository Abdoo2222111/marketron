import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { TikTokIntegration } from '../src/tiktok/index';
import { tokenManager } from '../src/utils/tokenManager';

describe('TikTok Ads Integration', () => {
  let tiktok: TikTokIntegration;
  let mock: MockAdapter;
  const testAdvertiserId = '1234567890';

  beforeEach(() => {
    tiktok = new TikTokIntegration(testAdvertiserId);
    mock = new MockAdapter(axios);
    // TikTok uses a different base URL
    mock.onAny().passThrough();
  });

  afterEach(() => {
    mock.restore();
    sinon.restore();
  });

  describe('OAuth Flow', () => {
    it('should generate auth URL with PKCE', async () => {
      const authUrl = await tiktok.getAuthUrl('https://example.com/callback');
      expect(authUrl).to.include('tiktok.com');
      expect(authUrl).to.include('code_challenge');
      expect(authUrl).to.include('code_challenge_method=S256');
    });

    it('should handle callback and exchange token', async () => {
      mock.onPost(/\/oauth2\/access_token/).reply(200, {
        data: {
          access_token: 'tiktok-access-token',
          token_type: 'Bearer',
          expires_in: 86400,
          scope: 'user.info.basic,user.info.profile,ad.management,business.management',
          advertiser_ids: [testAdvertiserId],
          advertiser_id: testAdvertiserId,
        },
      });

      const result = await tiktok.handleCallback('test-code', 'https://example.com/callback');
      expect(result).to.have.property('accessToken');
    });
  });

  describe('Campaign Management', () => {
    it('should get campaigns', async () => {
      mock.onPost('/open_api/v1.3/campaign/get').reply(200, {
        code: 0,
        message: 'OK',
        data: {
          list: [
            {
              campaign_id: '111',
              campaign_name: 'TikTok Campaign',
              objective: 'CONVERSIONS',
              status: 'CAMPAIGN_STATUS_ENABLE',
              budget: 5000,
              budget_mode: 'BUDGET_MODE_DAY',
              create_time: '2024-01-01 00:00:00',
              modify_time: '2024-01-02 00:00:00',
            },
          ],
          page_info: { total_page: 1, page: 1, page_size: 10, total_number: 1 },
        },
      });

      const campaigns = await tiktok.getCampaigns(testAdvertiserId);
      expect(campaigns).to.have.lengthOf(1);
      expect(campaigns[0]).to.include({ platform: 'tiktok' });
    });
  });

  describe('Insights', () => {
    it('should get campaign insights', async () => {
      mock.onPost('/open_api/v1.3/report/integrated/get').reply(200, {
        code: 0,
        message: 'OK',
        data: {
          list: [{
            campaign_id: '111',
            campaign_name: 'Campaign 1',
            impressions: '10000',
            clicks: '500',
            spend: '5000',
            ctr: '5.00',
            cpc: '10.00',
            conversions: '50',
            conversion_rate: '10.00',
            cost_per_conversion: '100.00',
            reach: '8000',
            frequency: '1.25',
            cpm: '500.00',
            video_views: '2000',
            video_views_rate: '20.00',
            date: '2024-01-01',
          }],
          page_info: { total_page: 1, page: 1, page_size: 10, total_number: 1 },
        },
      });

      const insights = await tiktok.getCampaignInsights(
        '111',
        new Date('2024-01-01'),
        new Date('2024-01-07')
      );

      expect(insights).to.have.property('impressions', 10000);
      expect(insights).to.have.property('clicks', 500);
      expect(insights).to.have.property('conversions', 50);
    });
  });
});
