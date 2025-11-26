/**
 * Threads Generation API Tests
 * Tests for /api/generate/threads endpoint (Issue #23)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from '@/app/api/generate/threads/route';
import { NextRequest } from 'next/server';

// Mock Gemini API
vi.mock('@/lib/ai/gemini', () => ({
  callGemini: vi.fn(),
  generateThreadsWithGemini: vi.fn(),
}));

describe('Threads Generation API - Issue #23', () => {
  describe('POST /api/generate/threads', () => {
    describe('New Format: Transcription + Buzz Analysis (F3-2)', () => {
      it('should generate Threads post from transcription and buzz analysis', async () => {
        const { callGemini } = await import('@/lib/ai/gemini');

        // Mock successful Gemini response
        vi.mocked(callGemini).mockResolvedValue(JSON.stringify({
          text: 'Hey everyone! Just discovered 3 amazing sustainable living tips that actually work! 1. Reusable everything 2. Buy local produce 3. Composting at home. Small changes, big impact!',
          hashtags: ['#sustainability', '#ecofriendly', '#greenlifestyle'],
          estimatedEngagement: 'high',
          callToAction: 'What is your favorite eco-friendly tip? Share below!',
        }));

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            transcription: {
              text: 'Hey everyone! Today I want to share 3 tips for sustainable living that have completely changed my daily routine...',
              language: 'en',
              duration: 45,
              confidence: 0.95,
            },
            buzzAnalysis: {
              buzzScore: 85,
              sentiment: 'positive',
              keyThemes: ['sustainability', 'eco-friendly', 'lifestyle'],
              recommendations: [
                'Add more visual examples',
                'Include statistics',
                'Use trending hashtags',
              ],
              analysis: 'High engagement potential due to trending topic and positive sentiment. Strong call-to-action opportunity.',
            },
            tone: 'inspirational',
            includeHashtags: true,
            includeCallToAction: true,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('success');
        expect(data.data.post).toBeDefined();
        expect(data.data.post.text).toBeDefined();
        expect(data.data.post.hashtags).toBeInstanceOf(Array);
        expect(data.data.post.characterCount).toBeLessThanOrEqual(500);
        expect(data.data.metadata.usedTranscription).toBe(true);
        expect(data.data.metadata.usedBuzzAnalysis).toBe(true);
      });

      it('should respect 500 character limit for Threads', async () => {
        const { callGemini } = await import('@/lib/ai/gemini');

        // Mock response with long text
        const longText = 'A'.repeat(600);
        vi.mocked(callGemini).mockResolvedValue(JSON.stringify({
          text: longText,
          hashtags: ['#test'],
          estimatedEngagement: 'medium',
        }));

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            transcription: {
              text: 'Test transcription',
            },
            buzzAnalysis: {
              buzzScore: 70,
              sentiment: 'neutral',
              keyThemes: ['test'],
              recommendations: [],
              analysis: 'Test analysis',
            },
            maxLength: 500,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.post.characterCount).toBeLessThanOrEqual(500);
        expect(data.data.post.text.length).toBeLessThanOrEqual(500);
      });

      it('should generate multiple variations when requested', async () => {
        const { callGemini } = await import('@/lib/ai/gemini');

        let callCount = 0;
        vi.mocked(callGemini).mockImplementation(async () => {
          callCount++;
          return JSON.stringify({
            text: `Variation ${callCount} of the Threads post with different tone and style.`,
            hashtags: [`#variation${callCount}`],
            estimatedEngagement: 'medium',
          });
        });

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            transcription: {
              text: 'Test content for variations',
            },
            buzzAnalysis: {
              buzzScore: 80,
              sentiment: 'positive',
              keyThemes: ['test'],
              recommendations: [],
              analysis: 'Test',
            },
            generateVariations: true,
            variationCount: 3,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.variations).toBeDefined();
        expect(data.data.variations.length).toBe(3);
        expect(callCount).toBe(3);
      });

      it('should validate post meets Threads requirements', async () => {
        const { callGemini } = await import('@/lib/ai/gemini');

        vi.mocked(callGemini).mockResolvedValue(JSON.stringify({
          text: 'Valid Threads post with proper length and formatting.',
          hashtags: ['#valid', '#test'],
          estimatedEngagement: 'high',
        }));

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            transcription: { text: 'Test' },
            buzzAnalysis: {
              buzzScore: 75,
              sentiment: 'positive',
              keyThemes: ['test'],
              recommendations: [],
              analysis: 'Test',
            },
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.data.metadata.validationResult).toBeDefined();
        expect(data.data.metadata.validationResult.valid).toBe(true);
        expect(data.data.metadata.validationResult.errors).toHaveLength(0);
      });

      it('should include formatted post ready for sharing', async () => {
        const { callGemini } = await import('@/lib/ai/gemini');

        vi.mocked(callGemini).mockResolvedValue(JSON.stringify({
          text: 'Amazing Threads post content!',
          hashtags: ['#amazing', '#threads'],
          estimatedEngagement: 'high',
          callToAction: 'What do you think? Let me know!',
        }));

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            transcription: { text: 'Test' },
            buzzAnalysis: {
              buzzScore: 90,
              sentiment: 'positive',
              keyThemes: ['test'],
              recommendations: [],
              analysis: 'Test',
            },
            includeHashtags: true,
            includeCallToAction: true,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.data.formattedPost).toBeDefined();
        expect(data.data.formattedPost).toContain('Amazing Threads post content!');
        expect(data.data.formattedPost).toContain('#amazing');
        expect(data.data.formattedPost).toContain('#threads');
      });
    });

    describe('Legacy Format: Topic-based (Backward Compatibility)', () => {
      it('should generate Threads from topic only', async () => {
        const { generateThreadsWithGemini } = await import('@/lib/ai/gemini');

        vi.mocked(generateThreadsWithGemini).mockResolvedValue({
          thread: [
            '1/5 Here is an interesting topic about AI',
            '2/5 AI is transforming how we work',
            '3/5 From automation to creativity',
            '4/5 The possibilities are endless',
            '5/5 What is your take on AI?',
          ],
          hashtags: ['#AI', '#Technology', '#Future'],
          callToAction: 'Share your thoughts below!',
        });

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            topic: 'The impact of AI on modern work',
            tone: 'professional',
            style: 'storytelling',
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('success');
        expect(data.data.thread).toBeDefined();
        expect(data.data.thread).toBeInstanceOf(Array);
        expect(data.data.hashtags).toBeDefined();
        expect(data.data.callToAction).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should reject request without required fields', async () => {
        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe('error');
        expect(data.error).toContain('Invalid request body');
      });

      it('should handle invalid JSON in request', async () => {
        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: 'invalid json',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe('error');
        expect(data.error).toBe('Invalid JSON in request body');
      });

      it('should handle API errors gracefully', async () => {
        const { callGemini } = await import('@/lib/ai/gemini');

        vi.mocked(callGemini).mockRejectedValue(new Error('API rate limit exceeded'));

        const request = new NextRequest('http://localhost:3000/api/generate/threads', {
          method: 'POST',
          body: JSON.stringify({
            transcription: { text: 'Test' },
            buzzAnalysis: {
              buzzScore: 70,
              sentiment: 'neutral',
              keyThemes: ['test'],
              recommendations: [],
              analysis: 'Test',
            },
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.status).toBe('error');
        expect(data.error).toBeDefined();
      });
    });

    describe('Tone Variations', () => {
      const tones = ['professional', 'casual', 'funny', 'inspirational', 'educational'] as const;

      tones.forEach((tone) => {
        it(`should generate post with ${tone} tone`, async () => {
          const { callGemini } = await import('@/lib/ai/gemini');

          vi.mocked(callGemini).mockResolvedValue(JSON.stringify({
            text: `A ${tone} Threads post about the topic.`,
            hashtags: [`#${tone}`],
            estimatedEngagement: 'medium',
          }));

          const request = new NextRequest('http://localhost:3000/api/generate/threads', {
            method: 'POST',
            body: JSON.stringify({
              transcription: { text: 'Test' },
              buzzAnalysis: {
                buzzScore: 75,
                sentiment: 'positive',
                keyThemes: ['test'],
                recommendations: [],
                analysis: 'Test',
              },
              tone,
            }),
          });

          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data.data.post.tone).toBe(tone);
        });
      });
    });
  });

  describe('GET /api/generate/threads', () => {
    it('should return API documentation', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/generate/threads');
      expect(data.method).toBe('POST');
      expect(data.description).toContain('F3-2');
      expect(data.formats.new).toBeDefined();
      expect(data.formats.legacy).toBeDefined();
    });

    it('should document required fields for new format', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.formats.new.required).toContain('transcription');
      expect(data.formats.new.required).toContain('buzzAnalysis');
    });

    it('should provide example request and response', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.formats.new.example.request).toBeDefined();
      expect(data.formats.new.example.response).toBeDefined();
    });
  });
});
