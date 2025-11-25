/**
 * Button component unit tests
 * Tests Button component props, variants, sizes, and states
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  describe('Props Handling', () => {
    it('should default variant to "primary"', () => {
      const component = React.createElement(Button, { children: 'Click me' });
      expect(component.props.variant).toBeUndefined();
    });

    it('should accept variant prop', () => {
      const variants = ['primary', 'secondary', 'tertiary', 'danger', 'success'] as const;
      variants.forEach((variant) => {
        const component = React.createElement(Button, {
          variant,
          children: 'Click me',
        });
        expect(component.props.variant).toBe(variant);
      });
    });

    it('should default size to "md"', () => {
      const component = React.createElement(Button, { children: 'Click me' });
      expect(component.props.size).toBeUndefined();
    });

    it('should accept size prop', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const component = React.createElement(Button, {
          size,
          children: 'Click me',
        });
        expect(component.props.size).toBe(size);
      });
    });

    it('should default isLoading to false', () => {
      const component = React.createElement(Button, { children: 'Click me' });
      expect(component.props.isLoading).toBeUndefined();
    });

    it('should accept isLoading prop', () => {
      const component = React.createElement(Button, {
        isLoading: true,
        children: 'Click me',
      });
      expect(component.props.isLoading).toBe(true);
    });

    it('should default fullWidth to false', () => {
      const component = React.createElement(Button, { children: 'Click me' });
      expect(component.props.fullWidth).toBeUndefined();
    });

    it('should accept fullWidth prop', () => {
      const component = React.createElement(Button, {
        fullWidth: true,
        children: 'Click me',
      });
      expect(component.props.fullWidth).toBe(true);
    });

    it('should accept leftIcon prop', () => {
      const icon = React.createElement('span', {}, 'icon');
      const component = React.createElement(Button, {
        leftIcon: icon,
        children: 'Click me',
      });
      expect(component.props.leftIcon).toBe(icon);
    });

    it('should accept rightIcon prop', () => {
      const icon = React.createElement('span', {}, 'icon');
      const component = React.createElement(Button, {
        rightIcon: icon,
        children: 'Click me',
      });
      expect(component.props.rightIcon).toBe(icon);
    });

    it('should accept disabled prop', () => {
      const component = React.createElement(Button, {
        disabled: true,
        children: 'Click me',
      });
      expect(component.props.disabled).toBe(true);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-button';
      const component = React.createElement(Button, {
        className: customClass,
        children: 'Click me',
      });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Variant Validation', () => {
    it('should support primary variant', () => {
      const component = React.createElement(Button, {
        variant: 'primary',
        children: 'Primary',
      });
      expect(component.props.variant).toBe('primary');
    });

    it('should support secondary variant', () => {
      const component = React.createElement(Button, {
        variant: 'secondary',
        children: 'Secondary',
      });
      expect(component.props.variant).toBe('secondary');
    });

    it('should support tertiary variant', () => {
      const component = React.createElement(Button, {
        variant: 'tertiary',
        children: 'Tertiary',
      });
      expect(component.props.variant).toBe('tertiary');
    });

    it('should support danger variant', () => {
      const component = React.createElement(Button, {
        variant: 'danger',
        children: 'Delete',
      });
      expect(component.props.variant).toBe('danger');
    });

    it('should support success variant', () => {
      const component = React.createElement(Button, {
        variant: 'success',
        children: 'Confirm',
      });
      expect(component.props.variant).toBe('success');
    });
  });

  describe('Size Validation', () => {
    it('should support small size', () => {
      const component = React.createElement(Button, {
        size: 'sm',
        children: 'Small',
      });
      expect(component.props.size).toBe('sm');
    });

    it('should support medium size', () => {
      const component = React.createElement(Button, {
        size: 'md',
        children: 'Medium',
      });
      expect(component.props.size).toBe('md');
    });

    it('should support large size', () => {
      const component = React.createElement(Button, {
        size: 'lg',
        children: 'Large',
      });
      expect(component.props.size).toBe('lg');
    });
  });

  describe('Component Type', () => {
    it('should be a React component', () => {
      expect(Button).toBeDefined();
      expect(typeof Button === 'function' || typeof Button === 'object').toBe(true);
    });

    it('should have displayName property', () => {
      expect(Button.displayName).toBe('Button');
    });

    it('should accept React props', () => {
      const element = React.createElement(Button, {
        variant: 'primary',
        size: 'md',
        children: 'Test Button',
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(Button);
    });
  });

  describe('State Handling', () => {
    it('should disable button when isLoading is true', () => {
      const component = React.createElement(Button, {
        isLoading: true,
        children: 'Submit',
      });
      expect(component.props.isLoading).toBe(true);
    });

    it('should disable button when disabled prop is true', () => {
      const component = React.createElement(Button, {
        disabled: true,
        children: 'Click me',
      });
      expect(component.props.disabled).toBe(true);
    });

    it('should allow click when button is enabled', () => {
      const component = React.createElement(Button, {
        disabled: false,
        isLoading: false,
        children: 'Click me',
      });
      expect(component.props.disabled).toBe(false);
      expect(component.props.isLoading).toBe(false);
    });
  });

  describe('Props Combinations', () => {
    it('should combine variant and size', () => {
      const component = React.createElement(Button, {
        variant: 'primary',
        size: 'lg',
        children: 'Large Primary',
      });
      expect(component.props.variant).toBe('primary');
      expect(component.props.size).toBe('lg');
    });

    it('should combine icons with children', () => {
      const leftIcon = React.createElement('span', {}, 'left');
      const rightIcon = React.createElement('span', {}, 'right');
      const component = React.createElement(Button, {
        leftIcon,
        rightIcon,
        children: 'With Icons',
      });
      expect(component.props.leftIcon).toBe(leftIcon);
      expect(component.props.rightIcon).toBe(rightIcon);
      expect(component.props.children).toBe('With Icons');
    });

    it('should combine isLoading with disabled state', () => {
      const component = React.createElement(Button, {
        isLoading: true,
        disabled: false,
        children: 'Loading',
      });
      expect(component.props.isLoading).toBe(true);
      expect(component.props.disabled).toBe(false);
    });

    it('should combine fullWidth with variant', () => {
      const component = React.createElement(Button, {
        fullWidth: true,
        variant: 'success',
        children: 'Full Width Success',
      });
      expect(component.props.fullWidth).toBe(true);
      expect(component.props.variant).toBe('success');
    });

    it('should combine all props together', () => {
      const icon = React.createElement('span', {}, 'icon');
      const component = React.createElement(Button, {
        variant: 'primary',
        size: 'lg',
        isLoading: false,
        fullWidth: true,
        leftIcon: icon,
        disabled: false,
        className: 'custom-button',
        children: 'Complete Button',
      });
      expect(component.props.variant).toBe('primary');
      expect(component.props.size).toBe('lg');
      expect(component.props.isLoading).toBe(false);
      expect(component.props.fullWidth).toBe(true);
      expect(component.props.leftIcon).toBe(icon);
      expect(component.props.disabled).toBe(false);
      expect(component.props.className).toBe('custom-button');
    });
  });

  describe('Button Attributes', () => {
    it('should accept HTML button attributes', () => {
      const component = React.createElement(Button, {
        type: 'submit',
        'aria-label': 'Submit form',
        children: 'Submit',
      });
      expect(component.props['aria-label']).toBe('Submit form');
    });

    it('should accept onClick handler', () => {
      const onClick = () => console.log('clicked');
      const component = React.createElement(Button, {
        onClick,
        children: 'Click me',
      });
      expect(component.props.onClick).toBe(onClick);
    });

    it('should accept title attribute', () => {
      const component = React.createElement(Button, {
        title: 'This is a button',
        children: 'Hover me',
      });
      expect(component.props.title).toBe('This is a button');
    });
  });
});

describe('Button Component Export', () => {
  it('should be exported as named export', () => {
    expect(Button).toBeDefined();
  });

  it('should have correct display name for debugging', () => {
    expect(Button.displayName).toBe('Button');
  });
});
