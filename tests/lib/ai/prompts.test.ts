/**
 * Tests for lib/ai/prompts.ts
 * Tests prompt template generation and formatting functions
 */

import { describe, it, expect } from 'vitest';
import {
  BUZZ_ANALYSIS_PROMPT,
  THREADS_GENERATION_PROMPT,
  REEL_SCRIPT_PROMPT,
  CAPTION_GENERATION_PROMPT,
  HASHTAG_RESEARCH_PROMPT,
  ENGAGEMENT_ANALYSIS_PROMPT,
  AUDIENCE_ANALYSIS_PROMPT,
  formatBuzzAnalysisPrompt,
  formatThreadsGenerationPrompt,
  formatReelScriptPrompt,
  formatCaptionGenerationPrompt,
  formatHashtagResearchPrompt,
} from '../../../lib/ai/prompts';

describe('Prompt Templates', () => {
  describe('Template Constants', () => {
    it('should export BUZZ_ANALYSIS_PROMPT template', () => {
      expect(BUZZ_ANALYSIS_PROMPT).toBeDefined();
      expect(BUZZ_ANALYSIS_PROMPT).toContain('Instagram expert');
      expect(BUZZ_ANALYSIS_PROMPT).toContain('buzzScore');
    });

    it('should export THREADS_GENERATION_PROMPT template', () => {
      expect(THREADS_GENERATION_PROMPT).toBeDefined();
      expect(THREADS_GENERATION_PROMPT).toContain('Threads');
      expect(THREADS_GENERATION_PROMPT).toContain('280 characters');
    });

    it('should export REEL_SCRIPT_PROMPT template', () => {
      expect(REEL_SCRIPT_PROMPT).toBeDefined();
      expect(REEL_SCRIPT_PROMPT).toContain('Reel script');
      expect(REEL_SCRIPT_PROMPT).toContain('scenes');
    });

    it('should export CAPTION_GENERATION_PROMPT template', () => {
      expect(CAPTION_GENERATION_PROMPT).toBeDefined();
      expect(CAPTION_GENERATION_PROMPT).toContain('caption');
      expect(CAPTION_GENERATION_PROMPT).toContain('call-to-action');
    });

    it('should export HASHTAG_RESEARCH_PROMPT template', () => {
      expect(HASHTAG_RESEARCH_PROMPT).toBeDefined();
      expect(HASHTAG_RESEARCH_PROMPT).toContain('hashtag');
      expect(HASHTAG_RESEARCH_PROMPT).toContain('strategy');
    });

    it('should export ENGAGEMENT_ANALYSIS_PROMPT template', () => {
      expect(ENGAGEMENT_ANALYSIS_PROMPT).toBeDefined();
      expect(ENGAGEMENT_ANALYSIS_PROMPT).toContain('engagement');
      expect(ENGAGEMENT_ANALYSIS_PROMPT).toContain('performance');
    });

    it('should export AUDIENCE_ANALYSIS_PROMPT template', () => {
      expect(AUDIENCE_ANALYSIS_PROMPT).toBeDefined();
      expect(AUDIENCE_ANALYSIS_PROMPT).toContain('audience');
      expect(AUDIENCE_ANALYSIS_PROMPT).toContain('demographics');
    });
  });

  describe('formatBuzzAnalysisPrompt', () => {
    it('should format prompt with all parameters', () => {
      const params = {
        content: 'Amazing sunset photo',
        likes: 1500,
        comments: 45,
        shares: 120,
        views: 5000,
        hashtags: ['#sunset', '#nature', '#photography'],
      };

      const result = formatBuzzAnalysisPrompt(params);

      expect(result).toContain('Amazing sunset photo');
      expect(result).toContain('1500');
      expect(result).toContain('45');
      expect(result).toContain('120');
      expect(result).toContain('5000');
      expect(result).toContain('#sunset, #nature, #photography');
    });

    it('should format prompt with only required content parameter', () => {
      const params = { content: 'Test content' };
      const result = formatBuzzAnalysisPrompt(params);

      expect(result).toContain('Test content');
      expect(result).toContain('0'); // Default values
    });

    it('should use default values for optional metrics', () => {
      const params = { content: 'Content' };
      const result = formatBuzzAnalysisPrompt(params);

      // Should contain the template structure
      expect(result).toContain('buzzScore');
      expect(result).toContain('sentiment');
      expect(result).toContain('virality');
    });

    it('should handle empty hashtags array', () => {
      const params = {
        content: 'Content',
        hashtags: [],
      };

      const result = formatBuzzAnalysisPrompt(params);
      expect(result).toContain('None');
    });

    it('should handle undefined hashtags', () => {
      const params = { content: 'Content' };
      const result = formatBuzzAnalysisPrompt(params);

      expect(result).toBeDefined();
      expect(result).toContain('Content');
    });
  });

  describe('formatThreadsGenerationPrompt', () => {
    it('should format prompt with all parameters', () => {
      const params = {
        topic: 'AI trends in 2025',
        tone: 'professional' as const,
        style: 'technical' as const,
      };

      const result = formatThreadsGenerationPrompt(params);

      expect(result).toContain('AI trends in 2025');
      expect(result).toContain('professional');
      expect(result).toContain('technical');
    });

    it('should use default tone when not provided', () => {
      const params = { topic: 'Machine Learning' };
      const result = formatThreadsGenerationPrompt(params);

      expect(result).toContain('Machine Learning');
      expect(result).toContain('casual'); // default tone
    });

    it('should use default style when not provided', () => {
      const params = { topic: 'Web Development' };
      const result = formatThreadsGenerationPrompt(params);

      expect(result).toContain('Web Development');
      expect(result).toContain('storytelling'); // default style
    });

    it('should support all tone options', () => {
      const tones = ['professional', 'casual', 'funny', 'inspirational'] as const;

      tones.forEach((tone) => {
        const result = formatThreadsGenerationPrompt({
          topic: 'Topic',
          tone,
        });
        expect(result).toContain(tone);
      });
    });

    it('should support all style options', () => {
      const styles = ['technical', 'storytelling', 'quick-tips'] as const;

      styles.forEach((style) => {
        const result = formatThreadsGenerationPrompt({
          topic: 'Topic',
          style,
        });
        expect(result).toContain(style);
      });
    });
  });

  describe('formatReelScriptPrompt', () => {
    it('should format prompt with all parameters', () => {
      const params = {
        topic: 'DIY Home Organization',
        duration: 60,
        style: 'tutorial' as const,
      };

      const result = formatReelScriptPrompt(params);

      expect(result).toContain('DIY Home Organization');
      expect(result).toContain('60'); // duration appears twice in template
    });

    it('should use default duration when not provided', () => {
      const params = { topic: 'Cooking Tips' };
      const result = formatReelScriptPrompt(params);

      expect(result).toContain('Cooking Tips');
      expect(result).toContain('30'); // default duration
    });

    it('should use default style when not provided', () => {
      const params = { topic: 'Fashion' };
      const result = formatReelScriptPrompt(params);

      expect(result).toContain('Fashion');
      expect(result).toContain('entertaining'); // default style
    });

    it('should support all style options', () => {
      const styles = ['educational', 'entertaining', 'tutorial', 'motivational'] as const;

      styles.forEach((style) => {
        const result = formatReelScriptPrompt({
          topic: 'Topic',
          style,
        });
        expect(result).toContain(style);
      });
    });

    it('should handle various duration values', () => {
      [15, 30, 45, 60].forEach((duration) => {
        const result = formatReelScriptPrompt({
          topic: 'Topic',
          duration,
        });
        expect(result).toContain(duration.toString());
      });
    });
  });

  describe('formatCaptionGenerationPrompt', () => {
    it('should format prompt with all parameters', () => {
      const params = {
        topic: 'Summer Collection Launch',
        postType: 'carousel' as const,
        tone: 'inspirational' as const,
        imageMood: 'vibrant and energetic',
      };

      const result = formatCaptionGenerationPrompt(params);

      expect(result).toContain('Summer Collection Launch');
      expect(result).toContain('carousel');
      expect(result).toContain('inspirational');
      expect(result).toContain('vibrant and energetic');
    });

    it('should use default postType when not provided', () => {
      const params = { topic: 'Product' };
      const result = formatCaptionGenerationPrompt(params);

      expect(result).toContain('Product');
      expect(result).toContain('feed'); // default postType
    });

    it('should use default tone when not provided', () => {
      const params = { topic: 'Product' };
      const result = formatCaptionGenerationPrompt(params);

      expect(result).toContain('casual'); // default tone
    });

    it('should use default imageMood when not provided', () => {
      const params = { topic: 'Product' };
      const result = formatCaptionGenerationPrompt(params);

      expect(result).toContain('engaging'); // default imageMood
    });

    it('should support all postType options', () => {
      const postTypes = ['carousel', 'reel', 'story', 'feed', 'igtv'] as const;

      postTypes.forEach((postType) => {
        const result = formatCaptionGenerationPrompt({
          topic: 'Topic',
          postType,
        });
        expect(result).toContain(postType);
      });
    });

    it('should support all tone options', () => {
      const tones = ['professional', 'casual', 'funny', 'inspirational'] as const;

      tones.forEach((tone) => {
        const result = formatCaptionGenerationPrompt({
          topic: 'Topic',
          tone,
        });
        expect(result).toContain(tone);
      });
    });
  });

  describe('formatHashtagResearchPrompt', () => {
    it('should format prompt with all parameters', () => {
      const params = {
        topic: 'Sustainable Fashion',
        targetAudience: 'eco-conscious millennials',
        accountSize: 'large',
        engagementLevel: 'high',
      };

      const result = formatHashtagResearchPrompt(params);

      expect(result).toContain('Sustainable Fashion');
      expect(result).toContain('eco-conscious millennials');
      expect(result).toContain('large');
      expect(result).toContain('high');
    });

    it('should use default values when optional parameters not provided', () => {
      const params = { topic: 'Topic' };
      const result = formatHashtagResearchPrompt(params);

      expect(result).toContain('Topic');
      expect(result).toContain('general'); // default audience
      expect(result).toContain('medium'); // default account size
      expect(result).toContain('average'); // default engagement
    });

    it('should handle all optional parameters as undefined', () => {
      const params = {
        topic: 'Topic',
        targetAudience: undefined,
        accountSize: undefined,
        engagementLevel: undefined,
      };

      const result = formatHashtagResearchPrompt(params);

      expect(result).toBeDefined();
      expect(result).toContain('Topic');
    });

    it('should generate valid JSON structure in output', () => {
      const params = {
        topic: 'Digital Marketing',
        targetAudience: 'businesses',
        accountSize: 'small',
        engagementLevel: 'medium',
      };

      const result = formatHashtagResearchPrompt(params);

      // Check for expected JSON structure
      expect(result).toContain('trending');
      expect(result).toContain('niche');
      expect(result).toContain('branded');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in content', () => {
      const params = {
        content: 'Amazing! "Best" ever #1 @friend',
        likes: 100,
      };

      const result = formatBuzzAnalysisPrompt(params);
      expect(result).toContain('Amazing! "Best" ever #1 @friend');
    });

    it('should handle long topic strings', () => {
      const longTopic = 'A very long topic that spans multiple words and contains lots of information about various aspects of content creation';
      const params = { topic: longTopic };

      const result = formatThreadsGenerationPrompt(params);
      expect(result).toContain(longTopic);
    });

    it('should handle zero metrics', () => {
      const params = {
        content: 'New post',
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      };

      const result = formatBuzzAnalysisPrompt(params);
      expect(result).toContain('0');
    });

    it('should handle large metric numbers', () => {
      const params = {
        content: 'Viral content',
        likes: 1000000,
        comments: 50000,
        shares: 100000,
        views: 5000000,
      };

      const result = formatBuzzAnalysisPrompt(params);
      expect(result).toContain('1000000');
      expect(result).toContain('5000000');
    });

    it('should handle hashtags with special formatting', () => {
      const params = {
        content: 'Content',
        hashtags: ['#AI', '#ML', '#DeepLearning', '#NeuralNetworks'],
      };

      const result = formatBuzzAnalysisPrompt(params);
      expect(result).toContain('#AI, #ML, #DeepLearning, #NeuralNetworks');
    });
  });

  describe('Consistency', () => {
    it('should return consistent results for same input', () => {
      const params = {
        content: 'Test',
        likes: 100,
        comments: 10,
      };

      const result1 = formatBuzzAnalysisPrompt(params);
      const result2 = formatBuzzAnalysisPrompt(params);

      expect(result1).toBe(result2);
    });

    it('should preserve template structure', () => {
      const params = {
        topic: 'Test Topic',
        tone: 'professional' as const,
      };

      const result = formatThreadsGenerationPrompt(params);

      // Should contain JSON structure hints
      expect(result).toContain('"thread"');
      expect(result).toContain('"hashtags"');
      expect(result).toContain('"callToAction"');
    });

    it('should not modify original parameters', () => {
      const params = {
        content: 'Original',
        likes: 100,
        hashtags: ['#tag1', '#tag2'],
      };

      const originalParams = JSON.stringify(params);
      formatBuzzAnalysisPrompt(params);

      expect(JSON.stringify(params)).toBe(originalParams);
    });
  });
});
