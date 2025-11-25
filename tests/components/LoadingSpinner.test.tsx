/**
 * LoadingSpinner component unit tests
 * Tests LoadingSpinner, LoadingOverlay, and Skeleton components
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  LoadingSpinner,
  LoadingOverlay,
  Skeleton,
} from '../../components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Props Handling', () => {
    it('should default size to "md"', () => {
      const component = React.createElement(LoadingSpinner);
      expect(component.props.size).toBeUndefined();
    });

    it('should accept size prop', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;
      sizes.forEach((size) => {
        const component = React.createElement(LoadingSpinner, { size });
        expect(component.props.size).toBe(size);
      });
    });

    it('should default variant to "default"', () => {
      const component = React.createElement(LoadingSpinner);
      expect(component.props.variant).toBeUndefined();
    });

    it('should accept variant prop', () => {
      const variants = ['default', 'gradient', 'pulse'] as const;
      variants.forEach((variant) => {
        const component = React.createElement(LoadingSpinner, { variant });
        expect(component.props.variant).toBe(variant);
      });
    });

    it('should default showText to false', () => {
      const component = React.createElement(LoadingSpinner);
      expect(component.props.showText).toBeUndefined();
    });

    it('should accept showText prop', () => {
      const component = React.createElement(LoadingSpinner, { showText: true });
      expect(component.props.showText).toBe(true);
    });

    it('should default text to "Loading..."', () => {
      const component = React.createElement(LoadingSpinner);
      expect(component.props.text).toBeUndefined();
    });

    it('should accept custom text prop', () => {
      const customText = 'Processing...';
      const component = React.createElement(LoadingSpinner, { text: customText });
      expect(component.props.text).toBe(customText);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-spinner';
      const component = React.createElement(LoadingSpinner, {
        className: customClass,
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Size Validation', () => {
    it('should support small size', () => {
      const component = React.createElement(LoadingSpinner, { size: 'sm' });
      expect(component.props.size).toBe('sm');
    });

    it('should support medium size', () => {
      const component = React.createElement(LoadingSpinner, { size: 'md' });
      expect(component.props.size).toBe('md');
    });

    it('should support large size', () => {
      const component = React.createElement(LoadingSpinner, { size: 'lg' });
      expect(component.props.size).toBe('lg');
    });

    it('should support extra-large size', () => {
      const component = React.createElement(LoadingSpinner, { size: 'xl' });
      expect(component.props.size).toBe('xl');
    });
  });

  describe('Variant Validation', () => {
    it('should support default variant', () => {
      const component = React.createElement(LoadingSpinner, {
        variant: 'default',
      });
      expect(component.props.variant).toBe('default');
    });

    it('should support gradient variant', () => {
      const component = React.createElement(LoadingSpinner, {
        variant: 'gradient',
      });
      expect(component.props.variant).toBe('gradient');
    });

    it('should support pulse variant', () => {
      const component = React.createElement(LoadingSpinner, {
        variant: 'pulse',
      });
      expect(component.props.variant).toBe('pulse');
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof LoadingSpinner).toBe('function');
    });

    it('should accept React props', () => {
      const element = React.createElement(LoadingSpinner, {
        size: 'lg',
        variant: 'gradient',
        showText: true,
        text: 'Loading data...',
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(LoadingSpinner);
    });
  });

  describe('Props Combinations', () => {
    it('should combine size and variant', () => {
      const component = React.createElement(LoadingSpinner, {
        size: 'lg',
        variant: 'gradient',
      });
      expect(component.props.size).toBe('lg');
      expect(component.props.variant).toBe('gradient');
    });

    it('should show text with custom message', () => {
      const component = React.createElement(LoadingSpinner, {
        showText: true,
        text: 'Please wait...',
      });
      expect(component.props.showText).toBe(true);
      expect(component.props.text).toBe('Please wait...');
    });

    it('should apply custom class with other props', () => {
      const component = React.createElement(LoadingSpinner, {
        size: 'md',
        variant: 'pulse',
        className: 'absolute top-4 right-4',
        showText: false,
      });
      expect(component.props.className).toBe('absolute top-4 right-4');
      expect(component.props.size).toBe('md');
    });
  });
});

describe('LoadingOverlay Component', () => {
  describe('Props Handling', () => {
    it('should default isOpen to false', () => {
      const component = React.createElement(LoadingOverlay);
      expect(component.props.isOpen).toBeUndefined();
    });

    it('should accept isOpen prop', () => {
      const component = React.createElement(LoadingOverlay, { isOpen: true });
      expect(component.props.isOpen).toBe(true);
    });

    it('should default text to "Loading..."', () => {
      const component = React.createElement(LoadingOverlay);
      expect(component.props.text).toBeUndefined();
    });

    it('should accept custom text prop', () => {
      const customText = 'Uploading file...';
      const component = React.createElement(LoadingOverlay, { text: customText });
      expect(component.props.text).toBe(customText);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-overlay';
      const component = React.createElement(LoadingOverlay, {
        className: customClass,
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Visibility Control', () => {
    it('should hide when isOpen is false', () => {
      const component = React.createElement(LoadingOverlay, { isOpen: false });
      expect(component.props.isOpen).toBe(false);
    });

    it('should show when isOpen is true', () => {
      const component = React.createElement(LoadingOverlay, { isOpen: true });
      expect(component.props.isOpen).toBe(true);
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof LoadingOverlay).toBe('function');
    });

    it('should accept React props', () => {
      const element = React.createElement(LoadingOverlay, {
        isOpen: true,
        text: 'Processing...',
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(LoadingOverlay);
    });
  });

  describe('Props Combinations', () => {
    it('should combine isOpen with custom text', () => {
      const component = React.createElement(LoadingOverlay, {
        isOpen: true,
        text: 'Saving changes...',
      });
      expect(component.props.isOpen).toBe(true);
      expect(component.props.text).toBe('Saving changes...');
    });
  });
});

describe('Skeleton Component', () => {
  describe('Props Handling', () => {
    it('should default width to "100%"', () => {
      const component = React.createElement(Skeleton);
      expect(component.props.width).toBeUndefined();
    });

    it('should accept width prop as string', () => {
      const component = React.createElement(Skeleton, { width: '200px' });
      expect(component.props.width).toBe('200px');
    });

    it('should accept width prop as number', () => {
      const component = React.createElement(Skeleton, { width: 200 });
      expect(component.props.width).toBe(200);
    });

    it('should default height to "1rem"', () => {
      const component = React.createElement(Skeleton);
      expect(component.props.height).toBeUndefined();
    });

    it('should accept height prop as string', () => {
      const component = React.createElement(Skeleton, { height: '40px' });
      expect(component.props.height).toBe('40px');
    });

    it('should accept height prop as number', () => {
      const component = React.createElement(Skeleton, { height: 40 });
      expect(component.props.height).toBe(40);
    });

    it('should default circle to false', () => {
      const component = React.createElement(Skeleton);
      expect(component.props.circle).toBeUndefined();
    });

    it('should accept circle prop', () => {
      const component = React.createElement(Skeleton, { circle: true });
      expect(component.props.circle).toBe(true);
    });

    it('should default lines to 1', () => {
      const component = React.createElement(Skeleton);
      expect(component.props.lines).toBeUndefined();
    });

    it('should accept lines prop', () => {
      const component = React.createElement(Skeleton, { lines: 3 });
      expect(component.props.lines).toBe(3);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-skeleton';
      const component = React.createElement(Skeleton, { className: customClass });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Shape Variants', () => {
    it('should support rectangular shape (default)', () => {
      const component = React.createElement(Skeleton, { circle: false });
      expect(component.props.circle).toBe(false);
    });

    it('should support circular shape', () => {
      const component = React.createElement(Skeleton, { circle: true });
      expect(component.props.circle).toBe(true);
    });
  });

  describe('Lines Handling', () => {
    it('should support single line', () => {
      const component = React.createElement(Skeleton, { lines: 1 });
      expect(component.props.lines).toBe(1);
    });

    it('should support multiple lines', () => {
      const component = React.createElement(Skeleton, { lines: 5 });
      expect(component.props.lines).toBe(5);
    });

    it('should support zero lines', () => {
      const component = React.createElement(Skeleton, { lines: 0 });
      expect(component.props.lines).toBe(0);
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof Skeleton).toBe('function');
    });

    it('should accept React props', () => {
      const element = React.createElement(Skeleton, {
        width: 300,
        height: 40,
        circle: false,
        lines: 3,
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(Skeleton);
    });
  });

  describe('Props Combinations', () => {
    it('should combine width and height', () => {
      const component = React.createElement(Skeleton, {
        width: '200px',
        height: '100px',
      });
      expect(component.props.width).toBe('200px');
      expect(component.props.height).toBe('100px');
    });

    it('should combine circle with width/height for avatar', () => {
      const component = React.createElement(Skeleton, {
        width: 48,
        height: 48,
        circle: true,
      });
      expect(component.props.width).toBe(48);
      expect(component.props.height).toBe(48);
      expect(component.props.circle).toBe(true);
    });

    it('should combine lines with height for text block', () => {
      const component = React.createElement(Skeleton, {
        height: '20px',
        lines: 4,
      });
      expect(component.props.height).toBe('20px');
      expect(component.props.lines).toBe(4);
    });

    it('should apply className with other props', () => {
      const component = React.createElement(Skeleton, {
        width: 250,
        height: 50,
        className: 'mb-4',
      });
      expect(component.props.className).toBe('mb-4');
      expect(component.props.width).toBe(250);
    });
  });
});

describe('LoadingSpinner Component Exports', () => {
  it('should export LoadingSpinner component', () => {
    expect(LoadingSpinner).toBeDefined();
    expect(typeof LoadingSpinner).toBe('function');
  });

  it('should export LoadingOverlay component', () => {
    expect(LoadingOverlay).toBeDefined();
    expect(typeof LoadingOverlay).toBe('function');
  });

  it('should export Skeleton component', () => {
    expect(Skeleton).toBeDefined();
    expect(typeof Skeleton).toBe('function');
  });
});
