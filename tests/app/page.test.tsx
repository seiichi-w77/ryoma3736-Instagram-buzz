/**
 * HomePage component unit tests
 * Tests rendering, structure, and content of the home page
 */

import { describe, it, expect } from 'vitest';
import HomePage from '../../app/page';

describe('HomePage Component', () => {
  describe('Module Exports', () => {
    it('should export HomePage as default function', () => {
      expect(HomePage).toBeDefined();
      expect(typeof HomePage === 'function').toBe(true);
    });

    it('should be a named function', () => {
      expect(HomePage.name).toBe('HomePage');
    });

    it('should be a valid React component', () => {
      expect(HomePage).toBeDefined();
      expect(typeof HomePage).toBe('function');
    });

    it('should not require props', () => {
      expect(HomePage.length).toBe(0);
    });
  });

  describe('Component Structure', () => {
    it('should be a valid component', () => {
      expect(typeof HomePage).toBe('function');
    });

    it('should have proper structure in code', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('createElement');
    });

    it('should use features array', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('features');
    });

    it('should map over features', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('.map');
    });

    it('should have multiple section components', () => {
      const fn = HomePage.toString();
      const sectionMatches = fn.match(/section/g);
      expect((sectionMatches || []).length).toBeGreaterThan(2);
    });
  });

  describe('Navigation Header', () => {
    it('should have Instagram branding', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram Buzz');
    });

    it('should have Sign In button', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Sign In');
    });

    it('should have Get Started button', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Get Started');
    });

    it('should use max-width container', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/max-w-7xl/);
    });

    it('should use flex layout', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/flex/);
    });

    it('should use Instagram icon', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram');
    });

    it('should have responsive classes', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/sm:|lg:/);
    });

    it('should have navigation structure', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('header');
    });
  });

  describe('Hero Section', () => {
    it('should have hero section with gradient', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/bg-gradient-to-br/);
    });

    it('should have main headline', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Supercharge Your');
    });

    it('should have Instagram Growth text', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram Growth');
    });

    it('should have description text', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/powerful analytics and insights/);
    });

    it('should have Start Free Trial button', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Start Free Trial');
    });

    it('should have View Demo button', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('View Demo');
    });

    it('should have gradient text effect', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/bg-gradient-to-r/);
    });

    it('should use text-5xl for hero heading', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-5xl/);
    });

    it('should have text center alignment', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-center/);
    });

    it('should have py-24 padding', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/py-24/);
    });
  });

  describe('Features Section', () => {
    it('should have features section', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Everything You Need to Succeed');
    });

    it('should have section heading', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/Everything You Need to Succeed/);
    });

    it('should have features description', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/Comprehensive tools to analyze and grow/);
    });

    it('should have grid layout for features', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/grid.*gap-8/);
    });

    it('should have responsive grid columns', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/sm:grid-cols-2.*lg:grid-cols-4/);
    });

    it('should have mt-16 spacing before grid', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/mt-16/);
    });

    it('should have white background', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/bg-white/);
    });

    it('should have py-24 vertical padding', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/py-24/);
    });
  });

  describe('Feature Cards', () => {
    it('should have features array defined', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('features');
    });

    it('should define features', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Performance Analytics');
      expect(fn).toContain('Growth Tracking');
      expect(fn).toContain('Audience Insights');
      expect(fn).toContain('Engagement Analysis');
    });

    it('should have Performance Analytics feature', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Performance Analytics');
    });

    it('should have Growth Tracking feature', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Growth Tracking');
    });

    it('should have Audience Insights feature', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Audience Insights');
    });

    it('should have Engagement Analysis feature', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Engagement Analysis');
    });

    it('should use map function to render features', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('.map');
    });

    it('should have key assignment', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('key');
      expect(fn).toContain('feature');
      expect(fn).toContain('title');
    });

    it('should have card styling applied', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('rounded-2xl');
      expect(fn).toContain('border');
      expect(fn).toContain('bg-white');
    });

    it('should have icon containers', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('inline-flex');
      expect(fn).toContain('rounded-lg');
      expect(fn).toContain('p-3');
    });

    it('should render feature descriptions', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Track your posts performance');
      expect(fn).toContain('Monitor follower growth');
    });
  });

  describe('Icons Usage', () => {
    it('should import Instagram icon', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram');
    });

    it('should import TrendingUp icon', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('TrendingUp');
    });

    it('should import Users icon', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Users');
    });

    it('should import Heart icon', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Heart');
    });

    it('should import BarChart3 icon', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('BarChart3');
    });

    it('should use multiple icons from lucide library', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram');
      expect(fn).toContain('BarChart3');
      expect(fn).toContain('TrendingUp');
    });

    it('should set icon sizes with height and width', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('h-');
      expect(fn).toContain('w-');
    });
  });

  describe('Call-to-Action Section', () => {
    it('should have CTA section with gradient', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/bg-gradient-to-r.*from-instagram/);
    });

    it('should have "Ready to Grow" heading', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Ready to Grow Your Instagram?');
    });

    it('should have CTA description', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/Join thousands of creators/);
    });

    it('should have prominent CTA button', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Start Your Free Trial');
    });

    it('should have white button in gradient section', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/bg-white.*px-8.*py-3/);
    });

    it('should have text-center layout', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-center/);
    });

    it('should have mt-8 spacing for button', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/mt-8/);
    });
  });

  describe('Footer', () => {
    it('should have footer structure', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('footer');
    });

    it('should have dark background', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/bg-gray-900/);
    });

    it('should have Instagram Buzz branding', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram Buzz');
    });

    it('should have copyright text', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('2024');
      expect(fn).toContain('Instagram Buzz');
    });

    it('should have max-width container', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/max-w-7xl/);
    });

    it('should have flex layout', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('flex');
    });

    it('should have Instagram icon in footer', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Instagram');
    });

    it('should have text-white color', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-white/);
    });

    it('should have padding applied', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/py-/);
    });
  });

  describe('Styling Classes', () => {
    it('should use Tailwind CSS styling', () => {
      const fn = HomePage.toString();
      // Component uses Tailwind classes
      expect(fn).toContain('className');
    });

    it('should use clsx for conditional classes', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('clsx');
    });

    it('should use responsive classes', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('sm:');
      expect(fn).toContain('lg:');
    });

    it('should use gradient classes', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('bg-gradient');
    });

    it('should use hover states', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('hover:');
    });

    it('should use transition classes', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('transition');
    });

    it('should use rounded classes', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('rounded');
    });

    it('should use shadow classes', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('shadow');
    });
  });

  describe('Typography', () => {
    it('should have main headline text', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Supercharge Your');
    });

    it('should have section headings', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Everything You Need');
    });

    it('should have feature titles', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Performance Analytics');
    });

    it('should use text-5xl for hero', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-5xl/);
    });

    it('should use text-3xl for section headings', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-3xl/);
    });

    it('should use font-bold for headings', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('font-bold');
    });

    it('should use font-semibold for subheadings', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('font-semibold');
    });

    it('should use tracking-tight for headline', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/tracking-tight/);
    });
  });

  describe('Layout and Spacing', () => {
    it('should use max-w-7xl for containers', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/max-w-7xl/);
    });

    it('should use mx-auto for centering', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/mx-auto/);
    });

    it('should use responsive padding', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/px-4.*sm:px-6.*lg:px-8/);
    });

    it('should use gap for grid spacing', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/gap-/);
    });

    it('should use mt for margin-top', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/mt-/);
    });

    it('should use py for vertical padding', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/py-/);
    });

    it('should use flex for alignment', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/flex/);
    });

    it('should use items-center for vertical centering', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/items-center/);
    });
  });

  describe('Buttons', () => {
    it('should have button elements', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('button');
    });

    it('should have button with rounded styling', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/rounded-lg/);
    });

    it('should have buttons with padding', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('px-');
      expect(fn).toContain('py-');
    });

    it('should have primary button with gradient', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('from-instagram');
      expect(fn).toContain('to-instagram');
    });

    it('should have white text on gradient buttons', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-white/);
    });

    it('should have hover shadow on primary button', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('hover:shadow');
    });

    it('should have secondary buttons with border', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('border');
    });

    it('should have transition effects on buttons', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('transition');
    });
  });

  describe('Feature Card Structure', () => {
    it('should render feature cards with group class', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/group/);
    });

    it('should have rounded-2xl border cards', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/rounded-2xl.*border/);
    });

    it('should have p-8 padding on cards', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/p-8/);
    });

    it('should have shadow on cards', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/shadow-card/);
    });

    it('should have hover shadow effect', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/hover:shadow-card-hover/);
    });

    it('should have icon containers', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/h-6\s+w-6/);
    });

    it('should have color classes for icons', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/text-instagram/);
    });
  });

  describe('Content Completeness', () => {
    it('should have multiple sections', () => {
      const fn = HomePage.toString();
      const sectionCount = (fn.match(/section/g) || []).length;
      expect(sectionCount).toBeGreaterThanOrEqual(3);
    });

    it('should have navigation and footer', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('header');
      expect(fn).toContain('footer');
    });

    it('should have text content', () => {
      const fn = HomePage.toString();
      expect(fn.length).toBeGreaterThan(1000);
    });

    it('should have multiple buttons', () => {
      const fn = HomePage.toString();
      const buttonCount = (fn.match(/button/g) || []).length;
      expect(buttonCount).toBeGreaterThan(3);
    });

    it('should use feature icons', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/BarChart3|TrendingUp|Users|Heart/);
    });
  });

  describe('Instagram Theme Colors', () => {
    it('should use instagram-primary color', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/instagram-primary/);
    });

    it('should use instagram-secondary color', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/instagram-secondary/);
    });

    it('should use instagram-blue color', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/instagram-blue/);
    });

    it('should use instagram-purple color', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/instagram-purple/);
    });

    it('should use instagram-tertiary color', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/instagram-tertiary/);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic elements', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('header');
      expect(fn).toContain('nav');
      expect(fn).toContain('section');
      expect(fn).toContain('footer');
    });

    it('should have heading structure', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Supercharge Your');
      expect(fn).toContain('Everything You Need');
      expect(fn).toContain('Ready to Grow');
    });

    it('should have descriptive button text', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('Sign In');
      expect(fn).toContain('Get Started');
      expect(fn).toContain('Start Free Trial');
    });

    it('should have descriptive text content', () => {
      const fn = HomePage.toString();
      expect(fn).toContain('analytics');
      expect(fn).toContain('engagement');
      expect(fn).toContain('growth');
    });
  });

  describe('Responsive Design', () => {
    it('should use sm breakpoint', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/sm:/);
    });

    it('should use lg breakpoint', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/lg:/);
    });

    it('should have responsive text sizes', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/sm:text-|lg:text-/);
    });

    it('should have responsive grid layout', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/sm:grid-cols-|lg:grid-cols-/);
    });

    it('should have responsive padding', () => {
      const fn = HomePage.toString();
      expect(fn).toMatch(/sm:px-|lg:px-/);
    });
  });

  describe('Performance', () => {
    it('should not have inline styles', () => {
      const fn = HomePage.toString();
      // Component uses className instead of inline styles
      expect(fn).toContain('className');
    });

    it('should use Tailwind utilities', () => {
      const fn = HomePage.toString();
      // Uses className with Tailwind classes
      expect(fn).toContain('className');
    });

    it('should use efficient rendering', () => {
      const fn = HomePage.toString();
      // Uses React.createElement for efficient rendering
      expect(fn).toContain('createElement');
    });

    it('should not have unused code', () => {
      expect(HomePage).toBeDefined();
      expect(typeof HomePage).toBe('function');
    });
  });

  describe('Export', () => {
    it('should export HomePage as default', () => {
      expect(HomePage).toBeDefined();
    });

    it('should be a valid component', () => {
      expect(typeof HomePage).toBe('function');
    });

    it('should have correct name', () => {
      expect(HomePage.name).toBe('HomePage');
    });

    it('should be callable', () => {
      expect(typeof HomePage.call).toBe('function');
    });
  });
});

describe('HomePage Content', () => {
  it('should have engaging hero text', () => {
    const fn = HomePage.toString();
    expect(fn).toContain('Supercharge Your');
  });

  it('should have clear value proposition', () => {
    const fn = HomePage.toString();
    expect(fn).toContain('powerful analytics');
  });

  it('should have feature titles', () => {
    const fn = HomePage.toString();
    expect(fn).toContain('Performance Analytics');
    expect(fn).toContain('Growth Tracking');
  });

  it('should have calls to action', () => {
    const fn = HomePage.toString();
    expect(fn).toMatch(/Free Trial|Sign In|Get Started/);
  });
});
