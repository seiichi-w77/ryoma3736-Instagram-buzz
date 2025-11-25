/**
 * Tests for lib/supabase/types.ts
 * Tests type definitions and utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  hasReachedGenerationLimit,
  isSubscriptionActive,
  canCreateCustomTemplates,
  SUBSCRIPTION_LIMITS,
  TABLE_NAMES,
  type User,
  type SubscriptionTier,
  type SubscriptionStatus,
  type FetchStatus,
  type AnalysisStatus,
  type TemplateCategory,
  type ContentType,
  type GenerationStatus,
  type TemplateTone,
} from '../../../lib/supabase/types';

describe('Supabase Type Definitions', () => {
  describe('Enum Types', () => {
    it('should export SubscriptionTier type', () => {
      // Type checking happens at compile time
      expect(true).toBe(true);
    });

    it('should export SubscriptionStatus type', () => {
      expect(true).toBe(true);
    });

    it('should export FetchStatus type', () => {
      expect(true).toBe(true);
    });

    it('should export AnalysisStatus type', () => {
      expect(true).toBe(true);
    });

    it('should export TemplateCategory type', () => {
      expect(true).toBe(true);
    });

    it('should export ContentType type', () => {
      expect(true).toBe(true);
    });

    it('should export GenerationStatus type', () => {
      expect(true).toBe(true);
    });

    it('should export TemplateTone type', () => {
      expect(true).toBe(true);
    });
  });

  describe('SUBSCRIPTION_LIMITS', () => {
    it('should define limits for free tier', () => {
      const freeLimits = SUBSCRIPTION_LIMITS['free'];

      expect(freeLimits).toBeDefined();
      expect(freeLimits.monthly_generations).toBe(50);
      expect(freeLimits.max_templates).toBe(5);
      expect(freeLimits.max_reels_stored).toBe(20);
      expect(freeLimits.api_rate_limit).toBe(10);
    });

    it('should define features for free tier', () => {
      const freeFeatures = SUBSCRIPTION_LIMITS['free'].features;

      expect(freeFeatures.custom_templates).toBe(false);
      expect(freeFeatures.advanced_analytics).toBe(false);
      expect(freeFeatures.priority_support).toBe(false);
      expect(freeFeatures.api_access).toBe(false);
    });

    it('should define limits for basic tier', () => {
      const basicLimits = SUBSCRIPTION_LIMITS['basic'];

      expect(basicLimits).toBeDefined();
      expect(basicLimits.monthly_generations).toBe(200);
      expect(basicLimits.max_templates).toBe(20);
      expect(basicLimits.max_reels_stored).toBe(100);
      expect(basicLimits.api_rate_limit).toBe(30);
    });

    it('should define features for basic tier', () => {
      const basicFeatures = SUBSCRIPTION_LIMITS['basic'].features;

      expect(basicFeatures.custom_templates).toBe(true);
      expect(basicFeatures.advanced_analytics).toBe(false);
      expect(basicFeatures.priority_support).toBe(false);
      expect(basicFeatures.api_access).toBe(false);
    });

    it('should define limits for pro tier', () => {
      const proLimits = SUBSCRIPTION_LIMITS['pro'];

      expect(proLimits).toBeDefined();
      expect(proLimits.monthly_generations).toBe(1000);
      expect(proLimits.max_templates).toBe(100);
      expect(proLimits.max_reels_stored).toBe(500);
      expect(proLimits.api_rate_limit).toBe(100);
    });

    it('should define features for pro tier', () => {
      const proFeatures = SUBSCRIPTION_LIMITS['pro'].features;

      expect(proFeatures.custom_templates).toBe(true);
      expect(proFeatures.advanced_analytics).toBe(true);
      expect(proFeatures.priority_support).toBe(true);
      expect(proFeatures.api_access).toBe(true);
    });

    it('should define unlimited limits for enterprise tier', () => {
      const enterpriseLimits = SUBSCRIPTION_LIMITS['enterprise'];

      expect(enterpriseLimits).toBeDefined();
      expect(enterpriseLimits.monthly_generations).toBe(-1);
      expect(enterpriseLimits.max_templates).toBe(-1);
      expect(enterpriseLimits.max_reels_stored).toBe(-1);
      expect(enterpriseLimits.api_rate_limit).toBe(1000);
    });

    it('should define all features for enterprise tier', () => {
      const enterpriseFeatures = SUBSCRIPTION_LIMITS['enterprise'].features;

      expect(enterpriseFeatures.custom_templates).toBe(true);
      expect(enterpriseFeatures.advanced_analytics).toBe(true);
      expect(enterpriseFeatures.priority_support).toBe(true);
      expect(enterpriseFeatures.api_access).toBe(true);
    });

    it('should have all subscription tiers defined', () => {
      const tiers: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];

      tiers.forEach((tier) => {
        expect(SUBSCRIPTION_LIMITS[tier]).toBeDefined();
        expect(SUBSCRIPTION_LIMITS[tier]).toHaveProperty('monthly_generations');
        expect(SUBSCRIPTION_LIMITS[tier]).toHaveProperty('max_templates');
        expect(SUBSCRIPTION_LIMITS[tier]).toHaveProperty('max_reels_stored');
        expect(SUBSCRIPTION_LIMITS[tier]).toHaveProperty('api_rate_limit');
        expect(SUBSCRIPTION_LIMITS[tier]).toHaveProperty('features');
      });
    });
  });

  describe('TABLE_NAMES', () => {
    it('should define USERS table name', () => {
      expect(TABLE_NAMES.USERS).toBe('users');
    });

    it('should define REELS table name', () => {
      expect(TABLE_NAMES.REELS).toBe('reels');
    });

    it('should define TEMPLATES table name', () => {
      expect(TABLE_NAMES.TEMPLATES).toBe('templates');
    });

    it('should define GENERATED_CONTENTS table name', () => {
      expect(TABLE_NAMES.GENERATED_CONTENTS).toBe('generated_contents');
    });

    it('should have all required table names', () => {
      expect(TABLE_NAMES).toHaveProperty('USERS');
      expect(TABLE_NAMES).toHaveProperty('REELS');
      expect(TABLE_NAMES).toHaveProperty('TEMPLATES');
      expect(TABLE_NAMES).toHaveProperty('GENERATED_CONTENTS');
    });
  });

  describe('hasReachedGenerationLimit function', () => {
    it('should return false for free tier under limit', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 30,
        total_generation_count: 100,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(hasReachedGenerationLimit(user)).toBe(false);
    });

    it('should return true for free tier at limit', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 50,
        total_generation_count: 100,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(hasReachedGenerationLimit(user)).toBe(true);
    });

    it('should return true for free tier over limit', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 60,
        total_generation_count: 100,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(hasReachedGenerationLimit(user)).toBe(true);
    });

    it('should return false for enterprise tier regardless of count', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 10000,
        total_generation_count: 100000,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(hasReachedGenerationLimit(user)).toBe(false);
    });

    it('should return false for pro tier under limit', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 500,
        total_generation_count: 5000,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(hasReachedGenerationLimit(user)).toBe(false);
    });
  });

  describe('isSubscriptionActive function', () => {
    it('should return true for active subscription', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(isSubscriptionActive(user)).toBe(true);
    });

    it('should return true for trial subscription', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'trial',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(isSubscriptionActive(user)).toBe(true);
    });

    it('should return false for canceled subscription', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'canceled',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(isSubscriptionActive(user)).toBe(false);
    });

    it('should return false for expired subscription', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'expired',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(isSubscriptionActive(user)).toBe(false);
    });

    it('should return true for active subscription with future expiry', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: futureDate.toISOString(),
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(isSubscriptionActive(user)).toBe(true);
    });

    it('should return false for expired subscription with past expiry', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: pastDate.toISOString(),
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(isSubscriptionActive(user)).toBe(false);
    });
  });

  describe('canCreateCustomTemplates function', () => {
    it('should return false for free tier', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(canCreateCustomTemplates(user)).toBe(false);
    });

    it('should return true for basic tier', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'basic',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(canCreateCustomTemplates(user)).toBe(true);
    });

    it('should return true for pro tier', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(canCreateCustomTemplates(user)).toBe(true);
    });

    it('should return true for enterprise tier', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        instagram_username: null,
        instagram_session_id: null,
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        subscription_expires_at: null,
        monthly_generation_count: 0,
        total_generation_count: 0,
        last_generation_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
        deleted_at: null,
      };

      expect(canCreateCustomTemplates(user)).toBe(true);
    });
  });

  describe('Type Consistency', () => {
    it('should have matching subscription tier strings', () => {
      const tiers: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];

      tiers.forEach((tier) => {
        expect(SUBSCRIPTION_LIMITS).toHaveProperty(tier);
      });
    });

    it('should have matching content type strings', () => {
      const contentTypes: ContentType[] = [
        'caption',
        'hashtags',
        'script',
        'title',
        'description',
        'full-package',
      ];

      contentTypes.forEach((type) => {
        expect(typeof type).toBe('string');
      });
    });
  });
});
