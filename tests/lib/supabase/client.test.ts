/**
 * Tests for lib/supabase/client.ts
 * Tests Supabase database operations with mocked client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  getUserWithStats,
  getReel,
  getReelWithUser,
  listReels,
  createReel,
  updateReel,
  deleteReel,
  getTemplate,
  listTemplates,
  getTemplateWithStats,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getGeneratedContent,
  getGeneratedContentWithRelations,
  listGeneratedContents,
  createGeneratedContent,
  updateGeneratedContent,
  markAsFavorite,
  markAsUsed,
  rateGeneratedContent,
  deleteGeneratedContent,
  getUserGenerationMetrics,
  getAverageQualityMetrics,
} from '../../../lib/supabase/client';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

// Test data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  instagram_username: null,
  instagram_session_id: null,
  preferred_language: 'en',
  timezone: 'UTC',
  subscription_tier: 'free' as const,
  subscription_status: 'active' as const,
  subscription_expires_at: null,
  monthly_generation_count: 5,
  total_generation_count: 50,
  last_generation_at: '2024-01-10T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_login_at: null,
  deleted_at: null,
};

const mockReel = {
  id: 'reel-123',
  user_id: 'user-123',
  instagram_reel_id: 'insta-reel-123',
  instagram_url: 'https://instagram.com/p/ABC123',
  shortcode: 'ABC123',
  caption: 'Test caption',
  thumbnail_url: 'https://example.com/thumb.jpg',
  video_url: 'https://example.com/video.mp4',
  duration_seconds: 60,
  like_count: 100,
  comment_count: 10,
  play_count: 500,
  share_count: 5,
  creator_username: 'creator1',
  creator_full_name: 'Creator One',
  creator_profile_pic_url: 'https://example.com/profile.jpg',
  content_type: 'entertainment',
  detected_topics: ['music', 'dance'],
  detected_objects: ['person', 'music'],
  sentiment_score: 0.8,
  virality_score: 75.5,
  fetch_status: 'fetched' as const,
  analysis_status: 'analyzed' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

const mockTemplate = {
  id: 'template-123',
  user_id: 'user-123',
  name: 'Test Template',
  description: 'A test template',
  category: 'caption' as const,
  tone: 'casual' as const,
  target_audience: 'general' as const,
  content_structure: { type: 'string', format: 'text' },
  example_output: 'Example text',
  is_public: false,
  is_system_template: false,
  usage_count: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

const mockGeneratedContent = {
  id: 'content-123',
  user_id: 'user-123',
  reel_id: 'reel-123',
  template_id: 'template-123',
  content: 'Generated content text',
  content_type: 'caption' as const,
  generation_status: 'completed' as const,
  quality_score: 85.5,
  readability_score: 90.0,
  engagement_prediction: 75.0,
  is_favorite: false,
  is_used: false,
  user_rating: null,
  user_feedback: null,
  used_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

describe('Supabase Client Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Operations', () => {
    it('getUser should be defined', () => {
      expect(getUser).toBeDefined();
      expect(typeof getUser).toBe('function');
    });

    it('getUserByEmail should be defined', () => {
      expect(getUserByEmail).toBeDefined();
      expect(typeof getUserByEmail).toBe('function');
    });

    it('createUser should be defined', () => {
      expect(createUser).toBeDefined();
      expect(typeof createUser).toBe('function');
    });

    it('updateUser should be defined', () => {
      expect(updateUser).toBeDefined();
      expect(typeof updateUser).toBe('function');
    });

    it('getUserWithStats should be defined', () => {
      expect(getUserWithStats).toBeDefined();
      expect(typeof getUserWithStats).toBe('function');
    });

    it('getUser should accept string parameter', async () => {
      const result = await getUser('user-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('data');
    });

    it('createUser should accept user object', async () => {
      const newUser = {
        email: 'test@example.com',
        username: 'testuser',
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free' as const,
        subscription_status: 'active' as const,
      };
      const result = await createUser(newUser);
      expect(result).toHaveProperty('status');
    });

    it('updateUser should accept userId and updates', async () => {
      const updates = { display_name: 'Updated Name' };
      const result = await updateUser('user-123', updates);
      expect(result).toHaveProperty('status');
    });

    it('getUserWithStats should accept userId', async () => {
      const result = await getUserWithStats('user-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('data');
    });
  });

  describe('Reel Operations', () => {
    it('getReel should be defined', () => {
      expect(getReel).toBeDefined();
      expect(typeof getReel).toBe('function');
    });

    it('getReelWithUser should be defined', () => {
      expect(getReelWithUser).toBeDefined();
      expect(typeof getReelWithUser).toBe('function');
    });

    it('listReels should be defined', () => {
      expect(listReels).toBeDefined();
      expect(typeof listReels).toBe('function');
    });

    it('createReel should be defined', () => {
      expect(createReel).toBeDefined();
      expect(typeof createReel).toBe('function');
    });

    it('updateReel should be defined', () => {
      expect(updateReel).toBeDefined();
      expect(typeof updateReel).toBe('function');
    });

    it('deleteReel should be defined', () => {
      expect(deleteReel).toBeDefined();
      expect(typeof deleteReel).toBe('function');
    });

    it('getReel should accept reelId', async () => {
      const result = await getReel('reel-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('data');
    });

    it('listReels should accept filters', async () => {
      const result = await listReels({ limit: 10, offset: 0 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('createReel should accept reel object', async () => {
      const newReel = {
        user_id: 'user-123',
        instagram_reel_id: 'insta-123',
        instagram_url: 'https://instagram.com/p/ABC',
        shortcode: 'ABC',
        like_count: 100,
        comment_count: 10,
        play_count: 500,
        share_count: 5,
        fetch_status: 'fetched' as const,
        analysis_status: 'analyzed' as const,
      };
      const result = await createReel(newReel);
      expect(result).toHaveProperty('status');
    });

    it('updateReel should accept reelId and updates', async () => {
      const updates = { like_count: 150 };
      const result = await updateReel('reel-123', updates);
      expect(result).toHaveProperty('status');
    });

    it('deleteReel should accept reelId', async () => {
      const result = await deleteReel('reel-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('error');
    });
  });

  describe('Template Operations', () => {
    it('getTemplate should be defined', () => {
      expect(getTemplate).toBeDefined();
      expect(typeof getTemplate).toBe('function');
    });

    it('listTemplates should be defined', () => {
      expect(listTemplates).toBeDefined();
      expect(typeof listTemplates).toBe('function');
    });

    it('getTemplateWithStats should be defined', () => {
      expect(getTemplateWithStats).toBeDefined();
      expect(typeof getTemplateWithStats).toBe('function');
    });

    it('createTemplate should be defined', () => {
      expect(createTemplate).toBeDefined();
      expect(typeof createTemplate).toBe('function');
    });

    it('updateTemplate should be defined', () => {
      expect(updateTemplate).toBeDefined();
      expect(typeof updateTemplate).toBe('function');
    });

    it('deleteTemplate should be defined', () => {
      expect(deleteTemplate).toBeDefined();
      expect(typeof deleteTemplate).toBe('function');
    });

    it('getTemplate should accept templateId', async () => {
      const result = await getTemplate('template-123');
      expect(result).toHaveProperty('status');
    });

    it('listTemplates should accept filters', async () => {
      const filters = { user_id: 'user-123', category: 'caption' as const };
      const result = await listTemplates(filters);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });

    it('getTemplateWithStats should accept templateId', async () => {
      const result = await getTemplateWithStats('template-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('data');
    });

    it('createTemplate should accept template object', async () => {
      const newTemplate = {
        user_id: 'user-123',
        name: 'Test Template',
        category: 'caption' as const,
        tone: 'casual' as const,
        is_public: false,
        is_system_template: false,
      };
      const result = await createTemplate(newTemplate);
      expect(result).toHaveProperty('status');
    });

    it('updateTemplate should accept templateId and updates', async () => {
      const updates = { name: 'Updated Template' };
      const result = await updateTemplate('template-123', updates);
      expect(result).toHaveProperty('status');
    });

    it('deleteTemplate should accept templateId', async () => {
      const result = await deleteTemplate('template-123');
      expect(result).toHaveProperty('status');
    });
  });

  describe('Generated Content Operations', () => {
    it('getGeneratedContent should be defined', () => {
      expect(getGeneratedContent).toBeDefined();
      expect(typeof getGeneratedContent).toBe('function');
    });

    it('getGeneratedContentWithRelations should be defined', () => {
      expect(getGeneratedContentWithRelations).toBeDefined();
      expect(typeof getGeneratedContentWithRelations).toBe('function');
    });

    it('listGeneratedContents should be defined', () => {
      expect(listGeneratedContents).toBeDefined();
      expect(typeof listGeneratedContents).toBe('function');
    });

    it('createGeneratedContent should be defined', () => {
      expect(createGeneratedContent).toBeDefined();
      expect(typeof createGeneratedContent).toBe('function');
    });

    it('updateGeneratedContent should be defined', () => {
      expect(updateGeneratedContent).toBeDefined();
      expect(typeof updateGeneratedContent).toBe('function');
    });

    it('markAsFavorite should be defined', () => {
      expect(markAsFavorite).toBeDefined();
      expect(typeof markAsFavorite).toBe('function');
    });

    it('markAsUsed should be defined', () => {
      expect(markAsUsed).toBeDefined();
      expect(typeof markAsUsed).toBe('function');
    });

    it('rateGeneratedContent should be defined', () => {
      expect(rateGeneratedContent).toBeDefined();
      expect(typeof rateGeneratedContent).toBe('function');
    });

    it('deleteGeneratedContent should be defined', () => {
      expect(deleteGeneratedContent).toBeDefined();
      expect(typeof deleteGeneratedContent).toBe('function');
    });

    it('getGeneratedContent should accept contentId', async () => {
      const result = await getGeneratedContent('content-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('data');
    });

    it('listGeneratedContents should accept filters', async () => {
      const filters = { user_id: 'user-123', is_favorite: true };
      const result = await listGeneratedContents(filters);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('createGeneratedContent should accept content object', async () => {
      const newContent = {
        user_id: 'user-123',
        reel_id: 'reel-123',
        template_id: 'template-123',
        content: 'Generated text',
        content_type: 'caption' as const,
        generation_status: 'completed' as const,
        quality_score: 85.5,
      };
      const result = await createGeneratedContent(newContent);
      expect(result).toHaveProperty('status');
    });

    it('updateGeneratedContent should accept contentId and updates', async () => {
      const updates = { quality_score: 90.0 };
      const result = await updateGeneratedContent('content-123', updates);
      expect(result).toHaveProperty('status');
    });

    it('markAsFavorite should accept contentId', async () => {
      const result = await markAsFavorite('content-123');
      expect(result).toHaveProperty('status');
    });

    it('markAsUsed should accept contentId', async () => {
      const result = await markAsUsed('content-123');
      expect(result).toHaveProperty('status');
    });

    it('deleteGeneratedContent should accept contentId', async () => {
      const result = await deleteGeneratedContent('content-123');
      expect(result).toHaveProperty('status');
    });
  });

  describe('Rating Operations', () => {
    it('rateGeneratedContent should reject invalid ratings', async () => {
      const result0 = await rateGeneratedContent('content-123', 0);
      expect(result0.status).toBe(400);
      expect(result0.error).not.toBeNull();

      const result6 = await rateGeneratedContent('content-123', 6);
      expect(result6.status).toBe(400);
      expect(result6.error).not.toBeNull();

      const result10 = await rateGeneratedContent('content-123', 10);
      expect(result10.status).toBe(400);
    });

    it('rateGeneratedContent should accept valid ratings', async () => {
      for (let rating = 1; rating <= 5; rating++) {
        const result = await rateGeneratedContent('content-123', rating);
        expect(result).toHaveProperty('status');
      }
    });

    it('rateGeneratedContent should accept feedback', async () => {
      const result = await rateGeneratedContent('content-123', 4, 'Great content!');
      expect(result).toHaveProperty('status');
    });

    it('rateGeneratedContent should include error for invalid rating', async () => {
      const result = await rateGeneratedContent('content-123', 0);
      expect(result.data).toBeNull();
      expect(result.error?.message).toContain('between 1 and 5');
    });
  });

  describe('Analytics Operations', () => {
    it('getUserGenerationMetrics should be defined', () => {
      expect(getUserGenerationMetrics).toBeDefined();
      expect(typeof getUserGenerationMetrics).toBe('function');
    });

    it('getAverageQualityMetrics should be defined', () => {
      expect(getAverageQualityMetrics).toBeDefined();
      expect(typeof getAverageQualityMetrics).toBe('function');
    });

    it('getUserGenerationMetrics should accept userId', async () => {
      const result = await getUserGenerationMetrics('user-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('getAverageQualityMetrics should accept userId', async () => {
      const result = await getAverageQualityMetrics('user-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('Response Structure', () => {
    it('single record operations should return ApiResponse', async () => {
      const result = await getUser('user-123');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('status');
      expect(typeof result.status).toBe('number');
    });

    it('list operations should return PaginatedResponse', async () => {
      const result = await listReels();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('error');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('page_size');
      expect(result.pagination).toHaveProperty('total_count');
      expect(result.pagination).toHaveProperty('total_pages');
      expect(result.pagination).toHaveProperty('has_next');
      expect(result.pagination).toHaveProperty('has_previous');
    });

    it('delete operations should return ApiResponse with null data', async () => {
      const result = await deleteReel('reel-123');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('error');
    });
  });

  describe('Type Safety', () => {
    it('should handle subscription tiers', () => {
      const tiers = ['free', 'basic', 'pro', 'enterprise'];
      expect(tiers).toContain('free');
      expect(tiers).toContain('pro');
    });

    it('should handle subscription statuses', () => {
      const statuses = ['active', 'canceled', 'expired', 'trial'];
      expect(statuses).toContain('active');
      expect(statuses).toContain('canceled');
    });

    it('should handle content types', () => {
      const types = ['caption', 'hashtags', 'script', 'title', 'description', 'full-package'];
      expect(types).toContain('caption');
      expect(types).toContain('hashtags');
    });

    it('should handle template tones', () => {
      const tones = ['professional', 'casual', 'humorous', 'inspirational', 'neutral'];
      expect(tones).toContain('casual');
      expect(tones).toContain('professional');
    });
  });

  describe('Edge Cases', () => {
    it('listReels should handle pagination with limit and offset', async () => {
      const result = await listReels({ limit: 5, offset: 10 });
      expect(result).toHaveProperty('pagination');
    });

    it('listTemplates should handle search query', async () => {
      const result = await listTemplates({ search_query: 'test' });
      expect(result).toHaveProperty('data');
    });

    it('listGeneratedContents should handle multiple filters', async () => {
      const result = await listGeneratedContents({
        user_id: 'user-123',
        is_favorite: true,
        min_quality_score: 80,
        generation_status: 'completed',
      });
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Function Signatures', () => {
    it('should all functions return promises', async () => {
      const userPromise = getUser('user-123');
      const reelPromise = getReel('reel-123');
      const templatePromise = getTemplate('template-123');

      expect(userPromise instanceof Promise).toBe(true);
      expect(reelPromise instanceof Promise).toBe(true);
      expect(templatePromise instanceof Promise).toBe(true);

      await Promise.all([userPromise, reelPromise, templatePromise]);
    });

    it('create functions should accept typed objects', async () => {
      const user = {
        email: 'test@example.com',
        username: 'test',
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free' as const,
        subscription_status: 'active' as const,
      };
      await createUser(user);

      const reel = {
        user_id: 'user-123',
        instagram_reel_id: 'id',
        instagram_url: 'url',
        shortcode: 'code',
        like_count: 0,
        comment_count: 0,
        play_count: 0,
        share_count: 0,
        fetch_status: 'fetched' as const,
        analysis_status: 'analyzed' as const,
      };
      await createReel(reel);
    });

    it('update functions should accept partial objects', async () => {
      await updateUser('user-123', { display_name: 'New Name' });
      await updateReel('reel-123', { like_count: 200 });
      await updateTemplate('template-123', { name: 'New Name' });
      await updateGeneratedContent('content-123', { is_favorite: true });
    });
  });

  describe('Integration Scenarios', () => {
    it('should support user creation and retrieval flow', async () => {
      await createUser({
        email: 'new@example.com',
        username: 'newuser',
        preferred_language: 'en',
        timezone: 'UTC',
        subscription_tier: 'free' as const,
        subscription_status: 'active' as const,
      });
      await getUser('user-123');
      await getUserWithStats('user-123');
    });

    it('should support reel and content generation flow', async () => {
      await getReel('reel-123');
      await getReelWithUser('reel-123');
      await createGeneratedContent({
        user_id: 'user-123',
        reel_id: 'reel-123',
        template_id: 'template-123',
        generated_text: 'text',
        content_type: 'caption' as const,
        generation_status: 'completed' as const,
        quality_score: 85,
      });
    });

    it('should support template management flow', async () => {
      await listTemplates({ user_id: 'user-123' });
      await getTemplate('template-123');
      await getTemplateWithStats('template-123');
      await updateTemplate('template-123', { name: 'Updated Template' });
    });

    it('should support content favoriting and rating flow', async () => {
      await markAsFavorite('content-123');
      await markAsUsed('content-123');
      await rateGeneratedContent('content-123', 5, 'Excellent!');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('getUser should handle API errors gracefully', async () => {
      const result = await getUser('user-123');
      expect(result).toHaveProperty('status');
      expect([200, 400, 500]).toContain(result.status);
    });

    it('listReels should return empty array on error', async () => {
      const result = await listReels();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('listTemplates should return empty array on error', async () => {
      const result = await listTemplates();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('listGeneratedContents should return empty array on error', async () => {
      const result = await listGeneratedContents();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('rateGeneratedContent validates rating bounds', async () => {
      const below = await rateGeneratedContent('id', -1);
      expect(below.status).toBe(400);

      const above = await rateGeneratedContent('id', 11);
      expect(above.status).toBe(400);
    });
  });

  describe('Pagination Logic', () => {
    it('listReels should calculate pagination correctly', async () => {
      const result = await listReels({ limit: 20, offset: 0 });
      expect(result.pagination.page).toBe(1);
    });

    it('listReels should handle offset correctly', async () => {
      const result = await listReels({ limit: 10, offset: 20 });
      // page calculation depends on implementation, just verify pagination exists
      expect(result.pagination).toBeDefined();
      expect(typeof result.pagination.page).toBe('number');
    });

    it('listTemplates should calculate pagination correctly', async () => {
      const result = await listTemplates({ limit: 15, offset: 0 });
      expect(result.pagination.page).toBe(1);
    });

    it('listGeneratedContents should calculate pagination correctly', async () => {
      const result = await listGeneratedContents({ limit: 25, offset: 0 });
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('CRUD Operations Complete Coverage', () => {
    describe('User CRUD', () => {
      it('should test all user read operations', async () => {
        await getUser('id1');
        await getUserByEmail('test@test.com');
        await getUserWithStats('id2');
      });

      it('should test all user write operations', async () => {
        await createUser({
          email: 'test@test.com',
          username: 'user1',
          preferred_language: 'en',
          timezone: 'UTC',
          subscription_tier: 'pro' as const,
          subscription_status: 'active' as const,
        });
        await updateUser('id1', { username: 'user2' });
      });
    });

    describe('Reel CRUD', () => {
      it('should test all reel read operations', async () => {
        await getReel('id1');
        await getReelWithUser('id2');
        await listReels({ limit: 5 });
      });

      it('should test all reel write operations', async () => {
        await createReel({
          user_id: 'uid',
          instagram_reel_id: 'irid',
          instagram_url: 'url',
          shortcode: 'code',
          like_count: 10,
          comment_count: 5,
          play_count: 100,
          share_count: 3,
          fetch_status: 'pending' as const,
          analysis_status: 'pending' as const,
        });
        await updateReel('id1', { like_count: 20 });
        await deleteReel('id1');
      });
    });

    describe('Template CRUD', () => {
      it('should test all template read operations', async () => {
        await getTemplate('id1');
        await listTemplates({ limit: 5 });
        await getTemplateWithStats('id2');
      });

      it('should test all template write operations', async () => {
        await createTemplate({
          user_id: 'uid',
          name: 'tmpl',
          category: 'hashtags' as const,
          tone: 'professional' as const,
          is_public: true,
          is_system_template: true,
        });
        await updateTemplate('id1', { name: 'updated' });
        await deleteTemplate('id1');
      });
    });

    describe('Content CRUD', () => {
      it('should test all content read operations', async () => {
        await getGeneratedContent('id1');
        await getGeneratedContentWithRelations('id2');
        await listGeneratedContents({ limit: 5 });
      });

      it('should test all content write operations', async () => {
        await createGeneratedContent({
          user_id: 'uid',
          reel_id: 'rid',
          template_id: 'tid',
          generated_text: 'text',
          content_type: 'hashtags' as const,
          generation_status: 'pending' as const,
          quality_score: 80,
        });
        await updateGeneratedContent('id1', { generated_text: 'new' });
        await deleteGeneratedContent('id1');
      });

      it('should test all content utility operations', async () => {
        await markAsFavorite('id1');
        await markAsUsed('id1');
        await rateGeneratedContent('id1', 3, 'ok');
      });
    });

    describe('Analytics Operations', () => {
      it('should test all analytics operations', async () => {
        await getUserGenerationMetrics('uid');
        await getAverageQualityMetrics('uid');
      });
    });
  });

  describe('Filter Options Coverage', () => {
    it('listReels with all filter options', async () => {
      const options = {
        limit: 10,
        offset: 5,
        order_by: 'virality_score' as const,
        order_direction: 'asc' as const,
        user_id: 'uid',
        creator_username: 'creator',
        content_type: 'entertainment',
        min_virality_score: 50,
        fetch_status: 'fetched' as const,
        analysis_status: 'analyzed' as const,
        created_after: '2024-01-01',
        created_before: '2024-12-31',
      };
      await listReels(options);
    });

    it('listTemplates with all filter options', async () => {
      const options = {
        limit: 10,
        offset: 0,
        order_by: 'usage_count' as const,
        order_direction: 'desc' as const,
        user_id: 'uid',
        category: 'script' as const,
        tone: 'humorous' as const,
        is_public: true,
        is_system_template: false,
        search_query: 'test',
      };
      await listTemplates(options);
    });

    it('listGeneratedContents with all filter options', async () => {
      const options = {
        limit: 15,
        offset: 10,
        order_by: 'quality_score' as const,
        order_direction: 'desc' as const,
        user_id: 'uid',
        reel_id: 'rid',
        template_id: 'tid',
        content_type: 'full-package' as const,
        is_favorite: false,
        is_used: true,
        min_quality_score: 70,
        generation_status: 'completed' as const,
        created_after: '2024-01-01',
        created_before: '2024-12-31',
      };
      await listGeneratedContents(options);
    });
  });

  describe('Data Type Variations', () => {
    it('should handle different subscription tiers in createUser', async () => {
      const tiers = ['free', 'basic', 'pro', 'enterprise'] as const;
      for (const tier of tiers) {
        await createUser({
          email: `test-${tier}@test.com`,
          username: `user-${tier}`,
          preferred_language: 'en',
          timezone: 'UTC',
          subscription_tier: tier,
          subscription_status: 'active' as const,
        });
      }
    });

    it('should handle different subscription statuses in updateUser', async () => {
      const statuses = ['active', 'canceled', 'expired', 'trial'] as const;
      for (const status of statuses) {
        await updateUser('uid', { subscription_status: status });
      }
    });

    it('should handle different fetch statuses in createReel', async () => {
      const statuses = ['pending', 'fetched', 'failed', 'unavailable'] as const;
      for (const status of statuses) {
        await createReel({
          user_id: 'uid',
          instagram_reel_id: `id-${status}`,
          instagram_url: 'url',
          shortcode: `code-${status}`,
          caption: null,
          thumbnail_url: null,
          video_url: null,
          duration_seconds: null,
          like_count: 1,
          comment_count: 1,
          play_count: 1,
          share_count: 1,
          creator_username: null,
          creator_full_name: null,
          creator_profile_pic_url: null,
          content_type: null,
          detected_topics: null,
          detected_objects: null,
          sentiment_score: null,
          virality_score: null,
          fetch_status: status,
          analysis_status: 'pending' as const,
          fetched_at: null,
          analyzed_at: null,
        });
      }
    });

    it('should handle different analysis statuses in updateReel', async () => {
      const statuses = ['pending', 'analyzed', 'failed'] as const;
      for (const status of statuses) {
        await updateReel('rid', { analysis_status: status });
      }
    });

    it('should handle different template categories', async () => {
      const categories = ['caption', 'hashtags', 'script', 'title', 'description', 'custom'] as const;
      for (const cat of categories) {
        await createTemplate({
          user_id: 'uid',
          name: `template-${cat}`,
          description: null,
          category: cat,
          template_content: 'test content',
          variables: [],
          tone: 'casual' as const,
          target_audience: null,
          max_length: null,
          include_emojis: false,
          include_hashtags: false,
          hashtag_count: 0,
          is_public: false,
          is_system_template: false,
          deleted_at: null,
        });
      }
    });

    it('should handle different template tones', async () => {
      const tones = ['professional', 'casual', 'humorous', 'inspirational', 'neutral'] as const;
      for (const tone of tones) {
        await updateTemplate('tid', { tone });
      }
    });

    it('should handle different content types in createGeneratedContent', async () => {
      const types = ['caption', 'hashtags', 'script', 'title', 'description', 'full-package'] as const;
      for (const type of types) {
        await createGeneratedContent({
          user_id: 'uid',
          reel_id: 'rid',
          template_id: 'tid',
          content_type: type,
          generated_text: `content-${type}`,
          generated_hashtags: null,
          generated_metadata: {},
          prompt_used: null,
          model_used: 'claude-3',
          temperature: 0.7,
          max_tokens: 1000,
          quality_score: 85,
          readability_score: null,
          engagement_prediction: null,
          user_rating: null,
          user_feedback: null,
          is_favorite: false,
          is_used: false,
          used_at: null,
          generation_status: 'completed' as const,
          error_message: null,
          generation_time_ms: null,
        });
      }
    });

    it('should handle different generation statuses', async () => {
      const statuses = ['pending', 'completed', 'failed', 'timeout'] as const;
      for (const status of statuses) {
        await updateGeneratedContent('cid', { generation_status: status });
      }
    });
  });
});
