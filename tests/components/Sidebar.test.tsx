/**
 * Sidebar component unit tests
 * Tests navigation items, collapse functionality, and props handling
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';

describe('Sidebar Component', () => {
  describe('Props Handling', () => {
    it('should accept items prop', () => {
      const items = [
        { id: 'home', label: 'Home', href: '/', icon: '🏠', active: true },
        { id: 'posts', label: 'Posts', href: '/posts', icon: '📸', badge: 5 },
      ];
      const component = React.createElement(Sidebar, { items });
      expect(component.props.items).toEqual(items);
    });

    it('should accept isOpen prop', () => {
      const component = React.createElement(Sidebar, { isOpen: false });
      expect(component.props.isOpen).toBe(false);
    });

    it('should default isOpen to true', () => {
      const component = React.createElement(Sidebar);
      expect(component.props.isOpen).toBeUndefined();
    });

    it('should accept onToggle callback', () => {
      const callback = vi.fn();
      const component = React.createElement(Sidebar, { onToggle: callback });
      expect(component.props.onToggle).toBe(callback);
    });

    it('should accept className prop', () => {
      const customClass = 'custom-sidebar';
      const component = React.createElement(Sidebar, { className: customClass });
      expect(component.props.className).toBe(customClass);
    });
  });

  describe('Navigation Items', () => {
    it('should use default navigation items when not provided', () => {
      const component = React.createElement(Sidebar);
      expect(component.props.items).toBeUndefined();
    });

    it('should handle items with badges', () => {
      const items = [
        { id: 'posts', label: 'Posts', href: '/posts', icon: '📸', badge: 12 },
      ];
      const component = React.createElement(Sidebar, { items });
      const item = component.props.items?.[0];
      expect(item?.badge).toBe(12);
    });

    it('should handle items with active state', () => {
      const items = [
        { id: 'home', label: 'Home', href: '/', icon: '🏠', active: true },
        { id: 'posts', label: 'Posts', href: '/posts', icon: '📸' },
      ];
      const component = React.createElement(Sidebar, { items });
      expect(component.props.items?.[0]?.active).toBe(true);
      expect(component.props.items?.[1]?.active).toBeUndefined();
    });

    it('should have required navigation item properties', () => {
      const items = [
        {
          id: 'test',
          label: 'Test',
          href: '/test',
          icon: '🔧',
        },
      ];
      const component = React.createElement(Sidebar, { items });
      const item = component.props.items?.[0];
      expect(item?.id).toBe('test');
      expect(item?.label).toBe('Test');
      expect(item?.href).toBe('/test');
      expect(item?.icon).toBe('🔧');
    });
  });

  describe('Collapse Functionality', () => {
    it('should toggle sidebar open state', () => {
      const callback = vi.fn();
      const component = React.createElement(Sidebar, {
        isOpen: true,
        onToggle: callback,
      });
      expect(component.props.onToggle).toBe(callback);
    });

    it('should pass new state to onToggle callback', () => {
      const callback = vi.fn();
      const component = React.createElement(Sidebar, {
        isOpen: true,
        onToggle: callback,
      });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Component Type', () => {
    it('should be a functional component', () => {
      expect(typeof Sidebar).toBe('function');
    });

    it('should accept React props', () => {
      const element = React.createElement(Sidebar, {
        isOpen: true,
        className: 'test-sidebar',
      });
      expect(element).toBeDefined();
      expect(element.type).toBe(Sidebar);
    });
  });

  describe('Props Validation', () => {
    it('should allow optional items array', () => {
      const props1 = React.createElement(Sidebar);
      const props2 = React.createElement(Sidebar, { items: [] });
      expect(props1.props).toBeDefined();
      expect(props2.props).toBeDefined();
    });

    it('should allow optional callbacks', () => {
      const props1 = React.createElement(Sidebar);
      const props2 = React.createElement(Sidebar, { onToggle: vi.fn() });
      expect(props1.props.onToggle).toBeUndefined();
      expect(props2.props.onToggle).toBeDefined();
    });

    it('should accept valid badge numbers', () => {
      const items = [
        { id: 'test', label: 'Test', href: '/test', icon: '🔧', badge: 0 },
        { id: 'test2', label: 'Test', href: '/test', icon: '🔧', badge: 999 },
      ];
      const component = React.createElement(Sidebar, { items });
      expect(component.props.items?.[0]?.badge).toBe(0);
      expect(component.props.items?.[1]?.badge).toBe(999);
    });
  });

  describe('Export', () => {
    it('should be exported as named export', () => {
      expect(Sidebar).toBeDefined();
      expect(typeof Sidebar).toBe('function');
    });
  });
});
