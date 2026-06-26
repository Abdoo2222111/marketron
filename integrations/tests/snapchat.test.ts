import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { SnapchatIntegration } from '../src/snapchat/index';

describe('Snapchat Ads Integration', () => {
  let snapchat: SnapchatIntegration;
  let mock: MockAdapter;

  beforeEach(() => {
    snapchat = new SnapchatIntegration('test-snapchat-token');
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('OAuth Flow', () => {
    it('should generate auth URL', async () => {
      const authUrl = await snapchat.getAuthUrl('https://example.com/callback');
      expect(authUrl).to.include('snapchat.com');
      expect(authUrl).to.include('accounts.snapchat.com');
    });

    it('should handle callback and exchange token', async () => {
      mock.onPost(/\/login\/oauth2\/access_token/).reply(200, {
        access_token: 'snapchat-access-token',
        refresh_token: 'snapchat-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'snapchat-marketing-api',
      });

      const result = await snapchat.handleCallback('test-code', 'https://example.com/callback');
      expect(result).to.have.property('accessToken');
    });
  });

  describe('Campaign Management', () => {
    it('should get campaigns', async () => {
      mock.onGet(/\/adaccounts\/\d+\/campaigns/).reply(200, {
        campaigns: [
          {
            id: '111',
            name: 'Snap Campaign',
            status: 'ACTIVE',
            objective: 'APP_INSTALLS',
            start_time: '2024-01-01T00:00:00.000Z',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
          },
        ],
      });

      const campaigns = await snapchat.getCampaigns('ad-account-123');
      expect(campaigns).to.have.lengthOf(1);
      expect(campaigns[0]).to.have.property('platform', 'snapchat');
    });
  });

  describe('Insights', () => {
    it('should get campaign insights', async () => {
      mock.onGet(/\/adaccounts\/\d+\/stats/).reply(200, {
        timeseries: [{
          dimension: [{ id: '111' }],
          timeseries_stat: [{
            start_time: '2024-01-01T00:00:00.000Z',
            end_time: '2024-01-07T00:00:00.000Z',
            stats: {
              impressions: '10000',
              swipes: '500',
              spend: '5000000', // in micro-dollars
              ctr: '5.00',
              swipe_up_rate: '3.50',
              video_views: '2000',
            },
          }],
        }],
      });

      const insights = await snapchat.getCampaignInsights(
        '111',
        new Date('2024-01-01'),
        new Date('2024-01-07')
      );

      expect(insights).to.exist;
      expect(insights).to.have.property('impressions', 10000);
    });
  });
});
