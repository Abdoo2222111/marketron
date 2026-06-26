import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { handleIntegrationError, createIntegrationError, createRateLimitError } from '../src/common/errorHandler';
import { rateLimiter } from '../src/utils/rateLimiter';
import { dataTransformer } from '../src/utils/dataTransformer';
import { oauthStateStore } from '../src/common/oauth';

describe('Shared Utilities', () => {
  describe('Error Handler', () => {
    it('should handle Facebook API error with Arabic message', () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: { code: 10, message: 'Permission denied' },
          },
        },
      };

      const result = handleIntegrationError(error, 'facebook');
      expect(result).to.have.property('code', '10');
      expect(result).to.have.property('messageAr');
      expect(result.messageAr).to.include('ليس لديك صلاحية');
      expect(result).to.have.property('retryable', false);
    });

    it('should handle rate limit error as retryable', () => {
      const error = {
        response: {
          status: 429,
          data: { error: { code: 4, message: 'Rate limit' } },
        },
      };

      const result = handleIntegrationError(error, 'facebook');
      expect(result).to.have.property('retryable', true);
      expect(result).to.have.property('status', 429);
    });

    it('should create rate limit error with Arabic message', () => {
      const error = createRateLimitError('tiktok', 60000);
      expect(error).to.have.property('retryable', true);
      expect(error).to.have.property('code', 'RATE_LIMIT');
      expect(error.messageAr).to.include('TikTok');
      expect(error.messageAr).to.include('60 ثانية');
    });

    it('should handle server errors as retryable', () => {
      const error = {
        response: {
          status: 503,
          data: { message: 'Service unavailable' },
        },
      };

      const result = handleIntegrationError(error, 'snapchat');
      expect(result).to.have.property('retryable', true);
    });

    it('should handle unknown errors gracefully', () => {
      const result = handleIntegrationError({ message: 'Network error' }, 'instagram');
      expect(result).to.have.property('code', 'UNKNOWN');
      expect(result).to.have.property('messageAr');
    });
  });

  describe('OAuth State Store', () => {
    it('should create and validate state', () => {
      const { state } = oauthStateStore.createState('facebook', 'https://example.com/callback');
      expect(state).to.be.a('string').with.lengthOf(64);

      const stored = oauthStateStore.validateState(state, 'facebook');
      expect(stored).to.not.be.null;
      expect(stored!.platform).to.equal('facebook');
      expect(stored!.redirectUri).to.equal('https://example.com/callback');
    });

    it('should reject invalid state', () => {
      const result = oauthStateStore.validateState('invalid-state', 'facebook');
      expect(result).to.be.null;
    });

    it('should reject state for wrong platform', () => {
      const { state } = oauthStateStore.createState('tiktok', 'https://example.com/callback');
      const result = oauthStateStore.validateState(state, 'facebook');
      expect(result).to.be.null;
    });
  });

  describe('Rate Limiter', () => {
    it('should allow requests within limits', async () => {
      const canProceed = await rateLimiter.checkRateLimit('facebook', 'test-key');
      expect(canProceed).to.be.true;
    });

    it('should track remaining requests', () => {
      const status = rateLimiter.getRateLimitStatus('facebook', 'test-key');
      expect(status).to.have.property('remaining');
      expect(status).to.have.property('limit');
      expect(status).to.have.property('resetTime');
    });
  });

  describe('Data Transformer', () => {
    it('should transform Facebook campaign to unified schema', () => {
      const fbCampaign = {
        id: '111',
        name: 'FB Campaign',
        status: 'ACTIVE',
        objective: 'CONVERSIONS',
        daily_budget: 5000,
        lifetime_budget: null,
        currency: 'USD',
        start_time: null,
        created_time: '2024-01-01T00:00:00+0000',
        updated_time: '2024-01-02T00:00:00+0000',
      };

      const unified = dataTransformer.transformCampaign('facebook', fbCampaign);
      expect(unified).to.have.property('id', '111');
      expect(unified).to.have.property('platform', 'facebook');
      expect(unified).to.have.property('status', 'ACTIVE');
      expect(unified.budget).to.not.be.null;
      expect(unified.budget!.amount).to.equal(5000);
      expect(unified.budget!.type).to.equal('DAILY');
    });

    it('should transform TikTok campaign to unified schema', () => {
      const ttCampaign = {
        campaign_id: '222',
        campaign_name: 'TikTok Campaign',
        objective: 'CONVERSIONS',
        status: 'CAMPAIGN_STATUS_ENABLE',
        budget: 10000,
        budget_mode: 'BUDGET_MODE_DAY',
        create_time: '2024-01-01 00:00:00',
        modify_time: '2024-01-02 00:00:00',
      };

      const unified = dataTransformer.transformCampaign('tiktok', ttCampaign);
      expect(unified).to.have.property('id', '222');
      expect(unified).to.have.property('platform', 'tiktok');
      expect(unified).to.have.property('status', 'ACTIVE');
    });

    it('should transform Snapchat campaign to unified schema', () => {
      const scCampaign = {
        id: '333',
        name: 'Snap Campaign',
        ad_account_id: 'ad-123',
        status: 'ACTIVE',
        objective: 'APP_INSTALLS',
        start_time: '2024-01-01T00:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      };

      const unified = dataTransformer.transformCampaign('snapchat', scCampaign);
      expect(unified).to.have.property('id', '333');
      expect(unified).to.have.property('platform', 'snapchat');
    });

    it('should transform Facebook insights to unified schema', () => {
      const fbInsights = {
        impressions: '10000',
        reach: '8000',
        frequency: '1.25',
        clicks: '500',
        ctr: '5.00',
        cpc: '0.50',
        cpm: '10.00',
        spend: '5000',
        actions: [{ action_type: 'purchase', value: '50' }],
        date_start: '2024-01-01',
        date_stop: '2024-01-07',
      };

      const unified = dataTransformer.transformInsights('facebook', fbInsights);
      expect(unified).to.have.property('impressions', 10000);
      expect(unified).to.have.property('conversions', 50);
      expect(unified).to.have.property('currency', 'USD');
    });
  });
});
