/**
 * Unit tests for Instagram URL Validator
 */

import { describe, it, expect } from 'vitest';
import {
  validateInstagramUrl,
  formatInstagramUrl,
  type ValidationResult,
} from '../../../lib/instagram/validator';

describe('Instagram Validator', () => {
  describe('validateInstagramUrl', () => {
    describe('reel URLs', () => {
      it('should validate instagram.com reel URL', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc123/'
        );

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('reel');
        expect(result.mediaId).toBe('abc123');
        expect(result.error).toBeUndefined();
      });

      it('should validate reel URL without www prefix', () => {
        const result = validateInstagramUrl('https://instagram.com/reel/xyz789/');

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('reel');
        expect(result.mediaId).toBe('xyz789');
      });

      it('should validate reel URL with query parameters', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc123/?utm_source=ig_web_button_share_sheet'
        );

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('reel');
        expect(result.mediaId).toBe('abc123');
      });

      it('should handle reel URL with uppercase characters', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/AbC123/'
        );

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('reel');
      });
    });

    describe('post URLs', () => {
      it('should validate instagram.com post URL', () => {
        const result = validateInstagramUrl('https://www.instagram.com/p/abc123/');

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('post');
        expect(result.mediaId).toBe('abc123');
      });

      it('should validate post URL without trailing slash', () => {
        const result = validateInstagramUrl('https://www.instagram.com/p/abc123');

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('post');
        expect(result.mediaId).toBe('abc123');
      });
    });

    describe('IGTV URLs', () => {
      it('should validate IGTV URL', () => {
        const result = validateInstagramUrl('https://www.instagram.com/tv/abc123/');

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('igtv');
        expect(result.mediaId).toBe('abc123');
      });
    });

    describe('clip URLs', () => {
      it('should validate clip URL', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/clip/abc123/'
        );

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('clip');
        expect(result.mediaId).toBe('abc123');
      });
    });

    describe('short URLs', () => {
      it('should validate instagr.am short URL', () => {
        const result = validateInstagramUrl('https://instagr.am/p/abc123/');

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('post');
        expect(result.mediaId).toBe('abc123');
      });

      it('should validate ig.me short URL', () => {
        const result = validateInstagramUrl('https://ig.me/reel/abc123/');

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('reel');
      });
    });

    describe('media IDs with special characters', () => {
      it('should accept alphanumeric media IDs', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc123xyz/'
        );

        expect(result.isValid).toBe(true);
        expect(result.mediaId).toBe('abc123xyz');
      });

      it('should accept media IDs with underscores', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc_123/'
        );

        expect(result.isValid).toBe(true);
        expect(result.mediaId).toBe('abc_123');
      });

      it('should accept media IDs with hyphens', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc-123/'
        );

        expect(result.isValid).toBe(true);
        expect(result.mediaId).toBe('abc-123');
      });
    });

    describe('invalid URLs', () => {
      it('should reject empty string', () => {
        const result = validateInstagramUrl('');

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should reject null-like values', () => {
        const result = validateInstagramUrl(null as unknown as string);

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should reject non-Instagram domains', () => {
        const result = validateInstagramUrl('https://www.twitter.com/user');

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Instagram domain');
      });

      it('should reject malformed URLs', () => {
        const result = validateInstagramUrl('not a url at all');

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should reject URLs without valid media path', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/invalid/'
        );

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should reject URLs with invalid media ID characters', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc%20123/'
        );

        expect(result.isValid).toBe(false);
      });

      it('should reject URLs without media ID', () => {
        const result = validateInstagramUrl('https://www.instagram.com/reel/');

        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('should handle URLs with multiple query parameters', () => {
        const url =
          'https://www.instagram.com/reel/abc123/?utm_source=ig&utm_medium=web';
        const result = validateInstagramUrl(url);

        expect(result.isValid).toBe(true);
        expect(result.mediaId).toBe('abc123');
      });

      it('should handle URLs with fragments', () => {
        const result = validateInstagramUrl(
          'https://www.instagram.com/reel/abc123/#comments'
        );

        expect(result.isValid).toBe(true);
        expect(result.mediaId).toBe('abc123');
      });

      it('should handle case-insensitive domain matching', () => {
        const result = validateInstagramUrl(
          'https://WWW.INSTAGRAM.COM/reel/abc123/'
        );

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('reel');
      });
    });
  });

  describe('formatInstagramUrl', () => {
    it('should format reel URL', () => {
      const url = formatInstagramUrl('abc123', 'reel');

      expect(url).toBe('https://www.instagram.com/reel/abc123/');
    });

    it('should format post URL', () => {
      const url = formatInstagramUrl('abc123', 'post');

      expect(url).toBe('https://www.instagram.com/p/abc123/');
    });

    it('should format IGTV URL', () => {
      const url = formatInstagramUrl('abc123', 'igtv');

      expect(url).toBe('https://www.instagram.com/tv/abc123/');
    });

    it('should format clip URL', () => {
      const url = formatInstagramUrl('abc123', 'clip');

      expect(url).toBe('https://www.instagram.com/clip/abc123/');
    });

    it('should default to post type', () => {
      const url = formatInstagramUrl('abc123');

      expect(url).toBe('https://www.instagram.com/p/abc123/');
    });

    it('should handle media IDs with special characters', () => {
      const url = formatInstagramUrl('abc_123-xyz', 'reel');

      expect(url).toBe('https://www.instagram.com/reel/abc_123-xyz/');
    });
  });

  describe('round-trip validation', () => {
    it('should validate formatted URL', () => {
      const mediaId = 'testid123';
      const type: 'reel' | 'post' | 'clip' | 'igtv' = 'reel';

      const formattedUrl = formatInstagramUrl(mediaId, type);
      const validation = validateInstagramUrl(formattedUrl);

      expect(validation.isValid).toBe(true);
      expect(validation.type).toBe(type);
      expect(validation.mediaId).toBe(mediaId);
    });
  });
});
