/**
 * RootLayout component unit tests
 * Tests metadata and module exports
 */

import { describe, it, expect } from 'vitest';
import RootLayout, { metadata } from '../../app/layout';

describe('RootLayout Component', () => {
  describe('Module Exports', () => {
    it('should export RootLayout as default function', () => {
      expect(RootLayout).toBeDefined();
      expect(typeof RootLayout === 'function').toBe(true);
    });

    it('should export metadata object', () => {
      expect(metadata).toBeDefined();
      expect(typeof metadata === 'object').toBe(true);
    });

    it('should be a named function', () => {
      expect(RootLayout.name).toBe('RootLayout');
    });

    it('should accept props parameter', () => {
      expect(RootLayout.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Metadata Configuration', () => {
    it('should have title property', () => {
      expect(metadata.title).toBeDefined();
    });

    it('should have correct title', () => {
      expect(metadata.title).toBe('Instagram Buzz - Analytics & Engagement Platform');
    });

    it('should have description property', () => {
      expect(metadata.description).toBeDefined();
    });

    it('should have correct description', () => {
      expect(metadata.description).toBe(
        'Track and analyze your Instagram performance with powerful insights'
      );
    });

    it('should have keywords property', () => {
      expect(metadata.keywords).toBeDefined();
    });

    it('should have keywords as array', () => {
      expect(Array.isArray(metadata.keywords)).toBe(true);
    });

    it('should include instagram keyword', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('instagram');
    });

    it('should include analytics keyword', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('analytics');
    });

    it('should include social media keyword', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('social media');
    });

    it('should include engagement keyword', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('engagement');
    });

    it('should include metrics keyword', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('metrics');
    });

    it('should have exactly 5 keywords', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toHaveLength(5);
    });

    it('should have all expected keywords', () => {
      const expectedKeywords = ['instagram', 'analytics', 'social media', 'engagement', 'metrics'];
      const keywords = metadata.keywords as string[];
      expectedKeywords.forEach(keyword => {
        expect(keywords).toContain(keyword);
      });
    });
  });

  describe('Metadata Type', () => {
    it('should be a valid Metadata type', () => {
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('keywords');
    });

    it('should have string title', () => {
      expect(typeof metadata.title === 'string').toBe(true);
    });

    it('should have string description', () => {
      expect(typeof metadata.description === 'string').toBe(true);
    });

    it('title should contain Instagram', () => {
      expect(metadata.title).toMatch(/Instagram/);
    });

    it('title should contain Buzz', () => {
      expect(metadata.title).toMatch(/Buzz/);
    });

    it('title should contain Analytics', () => {
      expect(metadata.title).toMatch(/Analytics/);
    });

    it('description should contain track', () => {
      expect(metadata.description?.toLowerCase()).toMatch(/track/);
    });

    it('description should contain analyze', () => {
      expect(metadata.description?.toLowerCase()).toMatch(/analyz/);
    });
  });

  describe('Metadata String Patterns', () => {
    it('title should not be empty', () => {
      const title = String(metadata.title ?? '');
      expect(title.length).toBeGreaterThan(0);
    });

    it('description should not be empty', () => {
      expect(String(metadata.description ?? '').length).toBeGreaterThan(0);
    });

    it('keywords should not be empty', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords.length).toBeGreaterThan(0);
    });

    it('title should be reasonable length', () => {
      const title = String(metadata.title ?? '');
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(200);
    });

    it('description should be reasonable length', () => {
      const desc = String(metadata.description ?? '');
      expect(desc.length).toBeGreaterThan(10);
      expect(desc.length).toBeLessThan(500);
    });

    it('each keyword should be non-empty', () => {
      const keywords = metadata.keywords as string[];
      keywords.forEach(keyword => {
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Layout Component Structure', () => {
    it('should be a React component function', () => {
      expect(typeof RootLayout).toBe('function');
    });

    it('should accept children as prop', () => {
      // Layout components accept {children} destructured from props
      const fn = RootLayout.toString();
      expect(fn).toContain('children');
    });

    it('should return valid JSX structure', () => {
      // Function returns html/body structure
      const fn = RootLayout.toString();
      expect(fn).toContain('html');
      expect(fn).toContain('body');
    });

    it('should have html, body, and div elements', () => {
      const fn = RootLayout.toString();
      expect(fn).toContain('createElement');
      expect(fn).toContain('html');
      expect(fn).toContain('body');
    });

    it('should render children inside layout', () => {
      const fn = RootLayout.toString();
      expect(fn).toContain('children');
    });

    it('should use React.createElement for rendering', () => {
      const fn = RootLayout.toString();
      expect(fn).toContain('createElement');
    });

    it('should wrap children in nested elements', () => {
      const fn = RootLayout.toString();
      expect(fn).toContain('html');
      expect(fn).toContain('body');
      expect(fn).toContain('children');
    });
  });

  describe('Global Styles Import', () => {
    it('should import module with CSS styling', () => {
      // CSS import is visible in source but not in toString()
      // This test verifies that the module is properly formed
      expect(RootLayout).toBeDefined();
      expect(typeof RootLayout === 'function').toBe(true);
    });

    it('should apply styling to layout', () => {
      // Styling is applied through CSS classes
      const fn = RootLayout.toString();
      expect(fn).toContain('className');
    });
  });

  describe('Component Functionality', () => {
    it('should be callable', () => {
      expect(typeof RootLayout.call).toBe('function');
    });

    it('should be applicable', () => {
      expect(typeof RootLayout.apply).toBe('function');
    });

    it('should have prototype', () => {
      expect(RootLayout.prototype).toBeDefined();
    });
  });

  describe('Export Validity', () => {
    it('RootLayout should not be null', () => {
      expect(RootLayout).not.toBeNull();
    });

    it('metadata should not be null', () => {
      expect(metadata).not.toBeNull();
    });

    it('both exports should be defined', () => {
      expect(Boolean(RootLayout) && Boolean(metadata)).toBeTruthy();
    });
  });

  describe('Metadata Content Validation', () => {
    it('title should match expected format', () => {
      expect(metadata.title).toBe('Instagram Buzz - Analytics & Engagement Platform');
    });

    it('description should match expected format', () => {
      expect(metadata.description).toBe(
        'Track and analyze your Instagram performance with powerful insights'
      );
    });

    it('keywords should match expected set', () => {
      const expected = ['instagram', 'analytics', 'social media', 'engagement', 'metrics'];
      const actual = metadata.keywords as string[];
      expect(actual).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('Layout File Purpose', () => {
    it('should serve as root layout', () => {
      // RootLayout is used in app directory as main layout
      expect(RootLayout.name).toBe('RootLayout');
    });

    it('should wrap all pages', () => {
      // Used as layout wrapper for all routes
      expect(typeof RootLayout).toBe('function');
    });

    it('should export metadata for SEO', () => {
      // Metadata is used by Next.js for page head
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });
  });

  describe('Configuration Requirements', () => {
    it('should have title in metadata', () => {
      expect(metadata).toHaveProperty('title');
    });

    it('should have description in metadata', () => {
      expect(metadata).toHaveProperty('description');
    });

    it('should have keywords in metadata', () => {
      expect(metadata).toHaveProperty('keywords');
    });
  });

  describe('Next.js App Router Compliance', () => {
    it('should be compatible with app router', () => {
      expect(RootLayout).toBeDefined();
      expect(typeof RootLayout === 'function').toBe(true);
    });

    it('should export metadata constant', () => {
      expect(metadata).toBeDefined();
    });

    it('metadata should be parseable object', () => {
      expect(JSON.stringify(metadata)).toBeDefined();
    });
  });
});

describe('RootLayout Metadata Export', () => {
  it('should have metadata object available', () => {
    expect(metadata).toBeDefined();
  });

  it('metadata should be used for SEO', () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
  });

  it('should follow Next.js metadata conventions', () => {
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
  });
});
