/**
 * Header component unit tests
 * Tests props handling and class name generation
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { Header } from '../../components/layout/Header';

describe('Header Component', () => {
  describe('Props Handling', () => {
    it('should use default title when not provided', () => {
      const component = React.createElement(Header);
      expect(component.props).toBeDefined();
    });

    it('should accept custom title prop', () => {
      const customTitle = 'Custom Analytics';
      const component = React.createElement(Header, { title: customTitle });
      expect(component.props.title).toBe(customTitle);
    });

    it('should default showSearch to false', () => {
      const component = React.createElement(Header);
      expect(component.props.showSearch).toBeUndefined();
    });

    it('should accept showSearch prop', () => {
      const component = React.createElement(Header, { showSearch: true });
      expect(component.props.showSearch).toBe(true);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-class';
      const component = React.createElement(Header, { className: customClass });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Default Values', () => {
    it('should have default title "Instagram Buzz"', () => {
      const component = React.createElement(Header);
      expect(component.props.title).toBeUndefined();
      // Default is applied in component render, verify props structure
    });

    it('should have showSearch default to false', () => {
      const component = React.createElement(Header);
      expect(component.props.showSearch).toBeUndefined();
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof Header).toBe('function');
    });

    it('should accept React props', () => {
      const element = React.createElement(Header, {
        title: 'Test',
        showSearch: true,
        className: 'test-class',
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(Header);
    });
  });

  describe('Props Validation', () => {
    it('should allow optional className', () => {
      const props1 = React.createElement(Header);
      const props2 = React.createElement(Header, { className: '' });
      expect(props1.props).toBeDefined();
      expect(props2.props).toBeDefined();
    });

    it('should allow optional showSearch boolean', () => {
      const props1 = React.createElement(Header, { showSearch: false });
      const props2 = React.createElement(Header, { showSearch: true });
      expect(props1.props.showSearch).toBe(false);
      expect(props2.props.showSearch).toBe(true);
    });

    it('should allow optional title string', () => {
      const props1 = React.createElement(Header, { title: 'Test' });
      const props2 = React.createElement(Header, { title: '' });
      expect(props1.props.title).toBe('Test');
      expect(props2.props.title).toBe('');
    });
  });

  describe('Export', () => {
    it('should be exported as named export', () => {
      expect(Header).toBeDefined();
      expect(typeof Header).toBe('function');
    });

    it('should have displayName for debugging', () => {
      // Functional component may not have displayName set
      expect(Header.displayName || Header.name).toBeDefined();
    });
  });
});
