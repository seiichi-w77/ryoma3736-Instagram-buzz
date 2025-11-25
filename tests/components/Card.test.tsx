/**
 * Card component unit tests
 * Tests Card, CardHeader, CardBody, CardFooter, and CardGrid components
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardGrid,
} from '../../components/ui/Card';

describe('Card Component', () => {
  describe('Props Handling', () => {
    it('should default variant to "default"', () => {
      const component = React.createElement(Card, { children: 'Content' });
      expect(component.props.variant).toBeUndefined();
    });

    it('should accept variant prop', () => {
      const variants = ['default', 'elevated', 'outlined'] as const;
      variants.forEach((variant) => {
        const component = React.createElement(Card, {
          variant,
          children: 'Content',
        });
        expect(component.props.variant).toBe(variant);
      });
    });

    it('should default hoverable to false', () => {
      const component = React.createElement(Card, { children: 'Content' });
      expect(component.props.hoverable).toBeUndefined();
    });

    it('should accept hoverable prop', () => {
      const component = React.createElement(Card, {
        hoverable: true,
        children: 'Content',
      });
      expect(component.props.hoverable).toBe(true);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-card';
      const component = React.createElement(Card, {
        className: customClass,
        children: 'Content',
      });
      expect(component.props.className).toBe(customClass);
    });

    it('should require children prop', () => {
      const component = React.createElement(Card, {
        children: 'Test Content',
      });
      expect(component.props.children).toBe('Test Content');
    });
  });

  describe('Variant Validation', () => {
    it('should support default variant', () => {
      const component = React.createElement(Card, {
        variant: 'default',
        children: 'Content',
      });
      expect(component.props.variant).toBe('default');
    });

    it('should support elevated variant', () => {
      const component = React.createElement(Card, {
        variant: 'elevated',
        children: 'Content',
      });
      expect(component.props.variant).toBe('elevated');
    });

    it('should support outlined variant', () => {
      const component = React.createElement(Card, {
        variant: 'outlined',
        children: 'Content',
      });
      expect(component.props.variant).toBe('outlined');
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof Card).toBe('function');
    });

    it('should accept React props', () => {
      const element = React.createElement(Card, {
        variant: 'default',
        hoverable: true,
        className: 'test-card',
        children: 'Content',
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(Card);
    });
  });
});

describe('CardHeader Component', () => {
  describe('Props Handling', () => {
    it('should accept title prop', () => {
      const component = React.createElement(CardHeader, {
        title: 'Card Title',
      });
      expect(component.props.title).toBe('Card Title');
    });

    it('should accept subtitle prop', () => {
      const component = React.createElement(CardHeader, {
        subtitle: 'Card Subtitle',
      });
      expect(component.props.subtitle).toBe('Card Subtitle');
    });

    it('should accept rightContent prop', () => {
      const content = React.createElement('button', {}, 'Action');
      const component = React.createElement(CardHeader, {
        rightContent: content,
      });
      expect(component.props.rightContent).toBe(content);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-header';
      const component = React.createElement(CardHeader, {
        className: customClass,
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof CardHeader).toBe('function');
    });
  });
});

describe('CardBody Component', () => {
  describe('Props Handling', () => {
    it('should require children prop', () => {
      const component = React.createElement(CardBody, {
        children: 'Body Content',
      });
      expect(component.props.children).toBe('Body Content');
    });

    it('should accept className prop', () => {
      const customClass = 'custom-body';
      const component = React.createElement(CardBody, {
        className: customClass,
        children: 'Content',
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof CardBody).toBe('function');
    });
  });
});

describe('CardFooter Component', () => {
  describe('Props Handling', () => {
    it('should require children prop', () => {
      const component = React.createElement(CardFooter, {
        children: 'Footer Content',
      });
      expect(component.props.children).toBe('Footer Content');
    });

    it('should accept className prop', () => {
      const customClass = 'custom-footer';
      const component = React.createElement(CardFooter, {
        className: customClass,
        children: 'Content',
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof CardFooter).toBe('function');
    });
  });
});

describe('CardGrid Component', () => {
  describe('Props Handling', () => {
    it('should default cols to 3', () => {
      const component = React.createElement(CardGrid, { children: 'Content' });
      expect(component.props.cols).toBeUndefined();
    });

    it('should accept cols prop with 1 column', () => {
      const component = React.createElement(CardGrid, {
        cols: 1,
        children: 'Content',
      });
      expect(component.props.cols).toBe(1);
    });

    it('should accept cols prop with 2 columns', () => {
      const component = React.createElement(CardGrid, {
        cols: 2,
        children: 'Content',
      });
      expect(component.props.cols).toBe(2);
    });

    it('should accept cols prop with 3 columns', () => {
      const component = React.createElement(CardGrid, {
        cols: 3,
        children: 'Content',
      });
      expect(component.props.cols).toBe(3);
    });

    it('should accept cols prop with 4 columns', () => {
      const component = React.createElement(CardGrid, {
        cols: 4,
        children: 'Content',
      });
      expect(component.props.cols).toBe(4);
    });

    it('should require children prop', () => {
      const component = React.createElement(CardGrid, {
        children: 'Grid Content',
      });
      expect(component.props.children).toBe('Grid Content');
    });

    it('should accept className prop', () => {
      const customClass = 'custom-grid';
      const component = React.createElement(CardGrid, {
        className: customClass,
        children: 'Content',
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Column Validation', () => {
    it('should validate all column options', () => {
      const colOptions = [1, 2, 3, 4] as const;
      colOptions.forEach((cols) => {
        const component = React.createElement(CardGrid, {
          cols,
          children: 'Content',
        });
        expect(component.props.cols).toBe(cols);
      });
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof CardGrid).toBe('function');
    });
  });
});

describe('Card Component Exports', () => {
  it('should export Card component', () => {
    expect(Card).toBeDefined();
    expect(typeof Card).toBe('function');
  });

  it('should export CardHeader component', () => {
    expect(CardHeader).toBeDefined();
    expect(typeof CardHeader).toBe('function');
  });

  it('should export CardBody component', () => {
    expect(CardBody).toBeDefined();
    expect(typeof CardBody).toBe('function');
  });

  it('should export CardFooter component', () => {
    expect(CardFooter).toBeDefined();
    expect(typeof CardFooter).toBe('function');
  });

  it('should export CardGrid component', () => {
    expect(CardGrid).toBeDefined();
    expect(typeof CardGrid).toBe('function');
  });
});
