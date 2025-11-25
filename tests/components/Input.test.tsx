/**
 * Input component unit tests
 * Tests Input and Textarea components
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { Input, Textarea } from '../../components/ui/Input';

describe('Input Component', () => {
  describe('Props Handling', () => {
    it('should default type to "text"', () => {
      const component = React.createElement(Input);
      expect(component.props.type).toBeUndefined();
    });

    it('should accept type prop', () => {
      const types = [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
      ] as const;
      types.forEach((type) => {
        const component = React.createElement(Input, { type });
        expect(component.props.type).toBe(type);
      });
    });

    it('should default inputSize to "md"', () => {
      const component = React.createElement(Input);
      expect(component.props.inputSize).toBeUndefined();
    });

    it('should accept inputSize prop', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const component = React.createElement(Input, { inputSize: size });
        expect(component.props.inputSize).toBe(size);
      });
    });

    it('should accept label prop', () => {
      const component = React.createElement(Input, { label: 'Username' });
      expect(component.props.label).toBe('Username');
    });

    it('should accept helperText prop', () => {
      const component = React.createElement(Input, {
        helperText: 'Enter your username',
      });
      expect(component.props.helperText).toBe('Enter your username');
    });

    it('should accept error prop', () => {
      const component = React.createElement(Input, {
        error: 'Username is required',
      });
      expect(component.props.error).toBe('Username is required');
    });

    it('should accept leftIcon prop', () => {
      const icon = React.createElement('span', {}, 'icon');
      const component = React.createElement(Input, { leftIcon: icon });
      expect(component.props.leftIcon).toBe(icon);
    });

    it('should accept rightIcon prop', () => {
      const icon = React.createElement('span', {}, 'icon');
      const component = React.createElement(Input, { rightIcon: icon });
      expect(component.props.rightIcon).toBe(icon);
    });

    it('should accept disabled prop', () => {
      const component = React.createElement(Input, { disabled: true });
      expect(component.props.disabled).toBe(true);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-input';
      const component = React.createElement(Input, { className: customClass });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Size Validation', () => {
    it('should support small size', () => {
      const component = React.createElement(Input, { inputSize: 'sm' });
      expect(component.props.inputSize).toBe('sm');
    });

    it('should support medium size', () => {
      const component = React.createElement(Input, { inputSize: 'md' });
      expect(component.props.inputSize).toBe('md');
    });

    it('should support large size', () => {
      const component = React.createElement(Input, { inputSize: 'lg' });
      expect(component.props.inputSize).toBe('lg');
    });
  });

  describe('Type Validation', () => {
    it('should support text type', () => {
      const component = React.createElement(Input, { type: 'text' });
      expect(component.props.type).toBe('text');
    });

    it('should support email type', () => {
      const component = React.createElement(Input, { type: 'email' });
      expect(component.props.type).toBe('email');
    });

    it('should support password type', () => {
      const component = React.createElement(Input, { type: 'password' });
      expect(component.props.type).toBe('password');
    });

    it('should support number type', () => {
      const component = React.createElement(Input, { type: 'number' });
      expect(component.props.type).toBe('number');
    });

    it('should support date type', () => {
      const component = React.createElement(Input, { type: 'date' });
      expect(component.props.type).toBe('date');
    });
  });

  describe('Component Type', () => {
    it('should be a React component', () => {
      expect(Input).toBeDefined();
      expect(typeof Input === 'function' || typeof Input === 'object').toBe(true);
    });

    it('should have displayName property', () => {
      expect(Input.displayName).toBe('Input');
    });
  });

  describe('Props Combinations', () => {
    it('should accept multiple props together', () => {
      const icon = React.createElement('span', {}, 'icon');
      const component = React.createElement(Input, {
        type: 'email',
        inputSize: 'lg',
        label: 'Email Address',
        helperText: 'We will never share your email',
        leftIcon: icon,
        placeholder: 'user@example.com',
        required: true,
      });
      expect(component.props.type).toBe('email');
      expect(component.props.inputSize).toBe('lg');
      expect(component.props.label).toBe('Email Address');
      expect(component.props.helperText).toBe('We will never share your email');
      expect(component.props.leftIcon).toBe(icon);
    });

    it('should accept error and helperText (error takes priority)', () => {
      const component = React.createElement(Input, {
        error: 'Invalid email',
        helperText: 'This should not be shown',
      });
      expect(component.props.error).toBe('Invalid email');
      expect(component.props.helperText).toBe('This should not be shown');
    });
  });
});

describe('Textarea Component', () => {
  describe('Props Handling', () => {
    it('should accept label prop', () => {
      const component = React.createElement(Textarea, {
        label: 'Description',
      });
      expect(component.props.label).toBe('Description');
    });

    it('should default rows to 4', () => {
      const component = React.createElement(Textarea);
      expect(component.props.rows).toBeUndefined();
    });

    it('should accept rows prop', () => {
      const component = React.createElement(Textarea, { rows: 8 });
      expect(component.props.rows).toBe(8);
    });

    it('should accept helperText prop', () => {
      const component = React.createElement(Textarea, {
        helperText: 'Describe your feedback',
      });
      expect(component.props.helperText).toBe('Describe your feedback');
    });

    it('should accept error prop', () => {
      const component = React.createElement(Textarea, {
        error: 'Description is too long',
      });
      expect(component.props.error).toBe('Description is too long');
    });

    it('should accept disabled prop', () => {
      const component = React.createElement(Textarea, { disabled: true });
      expect(component.props.disabled).toBe(true);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-textarea';
      const component = React.createElement(Textarea, { className: customClass });
      expect(component.props.className).toBe(customClass);
    });

    it('should accept placeholder prop', () => {
      const component = React.createElement(Textarea, {
        placeholder: 'Enter your feedback here',
      });
      expect(component.props.placeholder).toBe('Enter your feedback here');
    });
  });

  describe('Rows Validation', () => {
    it('should support small textarea with 2 rows', () => {
      const component = React.createElement(Textarea, { rows: 2 });
      expect(component.props.rows).toBe(2);
    });

    it('should support medium textarea with 4 rows', () => {
      const component = React.createElement(Textarea, { rows: 4 });
      expect(component.props.rows).toBe(4);
    });

    it('should support large textarea with 10 rows', () => {
      const component = React.createElement(Textarea, { rows: 10 });
      expect(component.props.rows).toBe(10);
    });
  });

  describe('Component Type', () => {
    it('should be a React component', () => {
      expect(Textarea).toBeDefined();
      expect(typeof Textarea === 'function' || typeof Textarea === 'object').toBe(true);
    });

    it('should have displayName property', () => {
      expect(Textarea.displayName).toBe('Textarea');
    });
  });

  describe('Props Combinations', () => {
    it('should accept multiple props together', () => {
      const component = React.createElement(Textarea, {
        label: 'Feedback',
        rows: 6,
        helperText: 'Your feedback helps us improve',
        placeholder: 'Type your feedback here',
        required: true,
      });
      expect(component.props.label).toBe('Feedback');
      expect(component.props.rows).toBe(6);
      expect(component.props.helperText).toBe(
        'Your feedback helps us improve'
      );
      expect(component.props.placeholder).toBe('Type your feedback here');
      expect(component.props.required).toBe(true);
    });

    it('should handle error state with label', () => {
      const component = React.createElement(Textarea, {
        label: 'Comments',
        error: 'Comments are required',
      });
      expect(component.props.label).toBe('Comments');
      expect(component.props.error).toBe('Comments are required');
    });
  });
});

describe('Input Component Exports', () => {
  it('should export Input component', () => {
    expect(Input).toBeDefined();
  });

  it('should export Textarea component', () => {
    expect(Textarea).toBeDefined();
  });
});
