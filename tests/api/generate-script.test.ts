/**
 * Unit tests for /api/generate/script route
 * Tests Reel script generation functionality with mocked Gemini API
 *
 * SUB-4 Implementation Tests:
 * - Tests new transcription + buzzAnalysis format
 * - Tests legacy topic-based format (backward compatibility)
 * - Tests output structure (hook, sections, CTA)
 * - Tests pacing information
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/generate/script/route';

// Mock the Gemini AI module
vi.mock('@/lib/ai/gemini', () => ({
  generateReelScriptWithGemini: vi.fn(),
}));

// Mock the script-generator module
vi.mock('@/lib/ai/script-generator', () => ({
  generateReelScript: vi.fn(),
  generateScriptVariations: vi.fn(),
  formatScript: vi.fn((script) => `Formatted: ${script.title}`),
  validateScript: vi.fn(() => ({
    valid: true,
    errors: [],
    warnings: [],
  })),
}));

import { generateReelScriptWithGemini } from '@/lib/ai/gemini';
import { generateReelScript, generateScriptVariations } from '@/lib/ai/script-generator';

describe('POST /api/generate/script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate script for valid topic (legacy format)', async () => {
    const mockScript = {
      script: 'Welcome to coffee making 101. First, gather your ingredients...',
      pacing: [
        {
          timeRange: '0-5s',
          description: 'Close-up of coffee beans',
          voiceover: 'Welcome to coffee making 101',
        },
        {
          timeRange: '5-10s',
          description: 'Pouring water',
          voiceover: 'Add hot water carefully',
        },
      ],
      musicSuggestion: 'Upbeat and energetic',
      transitionTips: ['Fade between scenes', 'Use quick cuts'],
    };

    vi.mocked(generateReelScriptWithGemini).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'How to make the perfect iced coffee',
          duration: 30,
          style: 'tutorial',
          platform: 'instagram',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    // Legacy format returns legacyScript instead of script
    expect(data.data.legacyScript).toBeDefined();
    expect(Array.isArray(data.data.pacing)).toBe(true);
    expect(data.data.musicSuggestion).toBe('Upbeat and energetic');
    expect(data.data.metadata.duration).toBe(30);
    expect(data.data.metadata.style).toBe('tutorial');
    expect(data.data.metadata.platform).toBe('instagram');
    expect(data.data.metadata.estimatedWordCount).toBeGreaterThan(0);
    expect(data.data.metadata.estimatedSpeakingPace).toContain('words per minute');
  });

  it('should use default parameters when not provided', async () => {
    const mockScript = {
      script: 'Test script',
      pacing: [],
      musicSuggestion: 'Relaxing',
      transitionTips: [],
    };

    vi.mocked(generateReelScriptWithGemini).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Basic topic',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.metadata.duration).toBe(30);
    expect(data.data.metadata.style).toBe('entertaining');
    expect(data.data.metadata.platform).toBe('instagram');
  });

  it('should handle missing topic field', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          duration: 45,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid request body');
  });

  it('should handle empty topic', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: '',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should handle topic exceeding max length', async () => {
    const tooLongTopic = 'a'.repeat(501);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: tooLongTopic,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should reject duration exceeding 300 seconds', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid topic',
          duration: 301,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should reject negative duration', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid topic',
          duration: -5,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: 'invalid json',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid JSON');
  });

  it('should handle Claude API errors', async () => {
    vi.mocked(generateReelScriptWithGemini).mockRejectedValue(
      new Error('Claude API error')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test topic',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Claude API error');
  });

  it('should calculate speaking pace correctly', async () => {
    const mockScript = {
      script: 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen',
      pacing: [],
      musicSuggestion: 'Test',
      transitionTips: [],
    };

    vi.mocked(generateReelScriptWithGemini).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Speed test',
          duration: 60,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    // 15 words in 60 seconds = 15 words per minute
    expect(data.data.metadata.estimatedSpeakingPace).toBe('15 words per minute');
  });

  it('should handle script with various styles', async () => {
    const mockScript = {
      script: 'Educational content',
      pacing: [],
      musicSuggestion: 'Educational',
      transitionTips: [],
    };

    vi.mocked(generateReelScriptWithGemini).mockResolvedValue(mockScript);

    const styles = ['educational', 'entertaining', 'tutorial', 'motivational'];

    for (const style of styles) {
      const request = new NextRequest(
        'http://localhost:3000/api/generate/script',
        {
          method: 'POST',
          body: JSON.stringify({
            topic: 'Test',
            style,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.style).toBe(style);
    }
  });

  it('should include timestamp in response', async () => {
    const mockScript = {
      script: 'Test',
      pacing: [],
      musicSuggestion: 'Test',
      transitionTips: [],
    };

    vi.mocked(generateReelScriptWithGemini).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe('string');
  });
});

describe('SUB-4: New Format - Transcription + Buzz Analysis', () => {
  it('should generate script from transcription and buzz analysis', async () => {
    const mockStructuredScript = {
      title: 'Amazing Productivity Hack',
      duration: 30,
      hook: {
        text: 'Stop! This will change everything.',
        duration: 3,
        visualSuggestion: 'Hand stopping camera',
        onScreenText: 'WAIT!',
      },
      sections: [
        {
          timestamp: '0:03-0:08',
          duration: 5,
          type: 'main' as const,
          voiceover: 'Here is the productivity hack',
          visualDescription: 'Show the technique',
          brollSuggestion: 'Time-lapse of work',
          emphasis: [{ text: 'productivity hack', type: 'emphasize' as const }],
          onScreenText: 'GAME CHANGER',
        },
      ],
      callToAction: {
        text: 'Try this today!',
        duration: 5,
        visualSuggestion: 'Thumbs up',
      },
      metadata: {
        totalWordCount: 75,
        estimatedPace: '150 words per minute',
        difficulty: 'easy' as const,
        equipmentNeeded: ['smartphone'],
        targetAudience: 'General audience',
      },
      musicSuggestion: {
        mood: 'upbeat',
        tempo: 'fast' as const,
        genres: ['pop', 'electronic'],
      },
      brollList: ['Time-lapse', 'Close-up shots'],
      hashtags: ['#productivity', '#lifehack'],
      caption: 'Try this amazing hack!',
      pacingNotes: ['Keep energy high', 'Emphasize key points'],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockStructuredScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: {
            text: 'Amazing productivity tip that saves hours',
            duration: 45,
            language: 'en',
          },
          buzzAnalysis: {
            buzzScore: 92,
            sentiment: 'positive',
            viralPotential: 'high',
            keyHooks: [
              {
                text: 'saves hours',
                hookType: 'benefit',
                strength: 9,
              },
            ],
            keyThemes: ['productivity', 'time-management'],
          },
          duration: 30,
          style: 'entertaining',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.script).toBeDefined();
    expect(data.data.script.hook).toBeDefined();
    expect(data.data.script.sections).toBeDefined();
    expect(data.data.script.callToAction).toBeDefined();
    expect(data.data.metadata.usedTranscription).toBe(true);
    expect(data.data.metadata.usedBuzzAnalysis).toBe(true);
  });

  it('should validate hook structure (first 3 seconds)', async () => {
    const mockScript = {
      title: 'Test',
      duration: 30,
      hook: {
        text: 'Attention-grabbing hook',
        duration: 3,
        visualSuggestion: 'Eye-catching visual',
      },
      sections: [],
      callToAction: {
        text: 'CTA',
        duration: 5,
        visualSuggestion: 'End screen',
      },
      metadata: {
        totalWordCount: 50,
        estimatedPace: '150 words per minute',
        difficulty: 'easy' as const,
        equipmentNeeded: [],
        targetAudience: 'General',
      },
      musicSuggestion: {
        mood: 'upbeat',
        tempo: 'medium' as const,
        genres: ['pop'],
      },
      brollList: [],
      hashtags: [],
      caption: '',
      pacingNotes: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: { text: 'Test content' },
          buzzAnalysis: { buzzScore: 80, sentiment: 'positive' },
          duration: 30,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.script.hook.text).toBeDefined();
    expect(data.data.script.hook.duration).toBeGreaterThanOrEqual(2);
    expect(data.data.script.hook.duration).toBeLessThanOrEqual(4);
    expect(data.data.script.hook.visualSuggestion).toBeDefined();
  });

  it('should include pacing information in sections', async () => {
    const mockScript = {
      title: 'Test',
      duration: 30,
      hook: {
        text: 'Hook',
        duration: 3,
        visualSuggestion: 'Visual',
      },
      sections: [
        {
          timestamp: '0:03-0:08',
          duration: 5,
          type: 'main' as const,
          voiceover: 'Main content',
          visualDescription: 'Visual description',
          emphasis: [{ text: 'key point', type: 'emphasize' as const }],
        },
        {
          timestamp: '0:08-0:13',
          duration: 5,
          type: 'transition' as const,
          voiceover: 'Transition',
          visualDescription: 'Transition visual',
        },
      ],
      callToAction: {
        text: 'CTA',
        duration: 5,
        visualSuggestion: 'End',
      },
      metadata: {
        totalWordCount: 50,
        estimatedPace: '150 words per minute',
        difficulty: 'easy' as const,
        equipmentNeeded: [],
        targetAudience: 'General',
      },
      musicSuggestion: {
        mood: 'upbeat',
        tempo: 'medium' as const,
        genres: ['pop'],
      },
      brollList: [],
      hashtags: [],
      caption: '',
      pacingNotes: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: { text: 'Content' },
          buzzAnalysis: { buzzScore: 75, sentiment: 'positive' },
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    const sections = data.data.script.sections;
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);

    sections.forEach((section: {timestamp: string; duration: number; type: string; voiceover: string; visualDescription: string;}) => {
      expect(section.timestamp).toBeDefined();
      expect(section.duration).toBeDefined();
      expect(section.type).toBeDefined();
      expect(section.voiceover).toBeDefined();
      expect(section.visualDescription).toBeDefined();
    });
  });

  it('should generate multiple variations when requested', async () => {
    const mockVariations = [
      {
        title: 'Variation 1',
        duration: 30,
        hook: { text: 'Hook 1', duration: 3, visualSuggestion: 'Visual 1' },
        sections: [],
        callToAction: { text: 'CTA 1', duration: 5, visualSuggestion: 'End 1' },
        metadata: { totalWordCount: 50, estimatedPace: '150 wpm', difficulty: 'easy' as const, equipmentNeeded: [], targetAudience: 'General' },
        musicSuggestion: { mood: 'upbeat', tempo: 'medium' as const, genres: ['pop'] },
        brollList: [],
        hashtags: [],
        caption: '',
        pacingNotes: [],
      },
      {
        title: 'Variation 2',
        duration: 30,
        hook: { text: 'Hook 2', duration: 3, visualSuggestion: 'Visual 2' },
        sections: [],
        callToAction: { text: 'CTA 2', duration: 5, visualSuggestion: 'End 2' },
        metadata: { totalWordCount: 50, estimatedPace: '150 wpm', difficulty: 'easy' as const, equipmentNeeded: [], targetAudience: 'General' },
        musicSuggestion: { mood: 'energetic', tempo: 'fast' as const, genres: ['electronic'] },
        brollList: [],
        hashtags: [],
        caption: '',
        pacingNotes: [],
      },
    ];

    vi.mocked(generateScriptVariations).mockResolvedValue(mockVariations);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: { text: 'Content for variations' },
          buzzAnalysis: { buzzScore: 85, sentiment: 'positive' },
          generateVariations: true,
          variationCount: 2,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.variations).toBeDefined();
    expect(Array.isArray(data.data.variations)).toBe(true);
    expect(data.data.variations.length).toBeGreaterThanOrEqual(1);
  });

  it('should include validation results', async () => {
    const mockScript = {
      title: 'Test',
      duration: 30,
      hook: { text: 'Hook', duration: 3, visualSuggestion: 'Visual' },
      sections: [],
      callToAction: { text: 'CTA', duration: 5, visualSuggestion: 'End' },
      metadata: { totalWordCount: 50, estimatedPace: '150 wpm', difficulty: 'easy' as const, equipmentNeeded: [], targetAudience: 'General' },
      musicSuggestion: { mood: 'upbeat', tempo: 'medium' as const, genres: ['pop'] },
      brollList: [],
      hashtags: [],
      caption: '',
      pacingNotes: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: { text: 'Test' },
          buzzAnalysis: { buzzScore: 70, sentiment: 'positive' },
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.metadata.validationResult).toBeDefined();
    expect(data.data.metadata.validationResult.valid).toBeDefined();
    expect(Array.isArray(data.data.metadata.validationResult.errors)).toBe(true);
    expect(Array.isArray(data.data.metadata.validationResult.warnings)).toBe(true);
  });
});

describe('GET /api/generate/script', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.endpoint).toBe('/api/generate/script');
    expect(data.method).toBe('POST');
    expect(data.description).toBeDefined();
  });

  it('should document both new and legacy formats', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.formats).toBeDefined();
    expect(data.formats.new).toBeDefined();
    expect(data.formats.legacy).toBeDefined();
    expect(data.formats.new.required).toContain('transcription');
    expect(data.formats.new.required).toContain('buzzAnalysis');
  });

  it('should include SUB-4 implementation notes', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.notes).toBeDefined();
    expect(Array.isArray(data.notes)).toBe(true);
    expect(data.notes.length).toBeGreaterThan(0);
  });
});
