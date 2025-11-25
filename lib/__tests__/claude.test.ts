/**
 * Tests for Claude API integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as claudeModule from '../ai/claude';

describe('Claude API Integration', () => {
  beforeEach(() => {
    // Set up environment
    process.env.ANTHROPIC_API_KEY = 'test-key-12345';
  });

  describe('callClaude', () => {
    it('should throw error when API key is not set', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      const result = claudeModule.callClaude('test prompt');
      await expect(result).rejects.toThrow(
        'ANTHROPIC_API_KEY environment variable is not set'
      );
    });

    it('should handle successful API calls', async () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              content: [
                {
                  type: 'text',
                  text: 'Test response from Claude',
                },
              ],
              usage: {
                input_tokens: 10,
                output_tokens: 20,
              },
            }),
        } as Response)
      );

      const result = await claudeModule.callClaude('test prompt');
      expect(result).toBe('Test response from Claude');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              error: { message: 'Unauthorized' },
            }),
        } as Response)
      );

      const result = claudeModule.callClaude('test prompt');
      await expect(result).rejects.toThrow('Claude API error');
    });
  });

  describe('analyzeBuzz', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    buzzScore: 85,
                    sentiment: 'positive',
                    keyThemes: ['theme1', 'theme2'],
                    recommendations: ['rec1', 'rec2'],
                    analysis: 'Test analysis',
                  }),
                },
              ],
              usage: {
                input_tokens: 10,
                output_tokens: 20,
              },
            }),
        } as Response)
      );
    });

    it('should analyze buzz metrics successfully', async () => {
      const result = await claudeModule.analyzeBuzz('Test content', {
        likes: 100,
        comments: 10,
        shares: 5,
        views: 1000,
      });

      expect(result).toBeDefined();
      expect(result.buzzScore).toBe(85);
      expect(result.sentiment).toBe('positive');
      expect(result.keyThemes).toEqual(['theme1', 'theme2']);
    });

    it('should handle empty metrics', async () => {
      const result = await claudeModule.analyzeBuzz('Test content');
      expect(result).toBeDefined();
      expect(result.buzzScore).toBe(85);
    });
  });

  describe('generateThreads', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    thread: [
                      'First post about topic',
                      'Second part of thread',
                      'Third part with conclusion',
                    ],
                    hashtags: ['#topic1', '#topic2'],
                    callToAction: 'Share your thoughts!',
                  }),
                },
              ],
              usage: {
                input_tokens: 10,
                output_tokens: 20,
              },
            }),
        } as Response)
      );
    });

    it('should generate threads successfully', async () => {
      const result = await claudeModule.generateThreads(
        'Test topic',
        'casual',
        'storytelling'
      );

      expect(result).toBeDefined();
      expect(result.thread).toBeInstanceOf(Array);
      expect(result.thread.length).toBe(3);
      expect(result.hashtags).toBeInstanceOf(Array);
      expect(result.callToAction).toBeDefined();
    });

    it('should use default tone and style', async () => {
      const result = await claudeModule.generateThreads('Test topic');
      expect(result).toBeDefined();
      expect(result.thread.length).toBeGreaterThan(0);
    });
  });

  describe('generateReelScript', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    script: 'Full reel script here...',
                    pacing: [
                      {
                        timeRange: '0-5s',
                        description: 'Opening scene',
                        voiceover: 'Welcome to my reel',
                      },
                    ],
                    musicSuggestion: 'upbeat',
                    transitionTips: [
                      'Use fade transition',
                      'Add music beat sync',
                    ],
                  }),
                },
              ],
              usage: {
                input_tokens: 10,
                output_tokens: 20,
              },
            }),
        } as Response)
      );
    });

    it('should generate reel script successfully', async () => {
      const result = await claudeModule.generateReelScript(
        'Test topic',
        30,
        'entertaining'
      );

      expect(result).toBeDefined();
      expect(result.script).toBeDefined();
      expect(result.pacing).toBeInstanceOf(Array);
      expect(result.musicSuggestion).toBeDefined();
      expect(result.transitionTips).toBeInstanceOf(Array);
    });

    it('should use default duration and style', async () => {
      const result = await claudeModule.generateReelScript('Test topic');
      expect(result).toBeDefined();
      expect(result.script).toBeDefined();
    });
  });

  describe('generateCaption', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    caption: 'Amazing content caption here!',
                    hashtags: ['#amazing', '#content'],
                    callToAction: 'Double tap if you agree!',
                    estimatedEngagement: 'high',
                  }),
                },
              ],
              usage: {
                input_tokens: 10,
                output_tokens: 20,
              },
            }),
        } as Response)
      );
    });

    it('should generate caption successfully', async () => {
      const result = await claudeModule.generateCaption(
        'Test topic',
        'portrait',
        'casual',
        true
      );

      expect(result).toBeDefined();
      expect(result.caption).toBeDefined();
      expect(result.hashtags).toBeInstanceOf(Array);
      expect(result.callToAction).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(
        result.estimatedEngagement
      );
    });

    it('should generate caption without hashtags', async () => {
      const result = await claudeModule.generateCaption(
        'Test topic',
        'portrait',
        'casual',
        false
      );

      expect(result).toBeDefined();
      expect(result.caption).toBeDefined();
    });

    it('should use default parameters', async () => {
      const result = await claudeModule.generateCaption('Test topic');
      expect(result).toBeDefined();
      expect(result.caption).toBeDefined();
    });
  });
});
