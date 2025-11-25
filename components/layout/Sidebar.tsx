'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

/**
 * Navigation item type
 */
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  active?: boolean;
}

/**
 * Sidebar navigation component
 * Provides collapsible sidebar with navigation links
 */
interface SidebarProps {
  /** Navigation items to display */
  items?: NavItem[];
  /** Show sidebar (mobile) */
  isOpen?: boolean;
  /** Callback when sidebar toggle is clicked */
  onToggle?: (isOpen: boolean) => void;
  /** Optional CSS classes */
  className?: string;
}

const defaultItems: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '/', icon: '📊', active: true },
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📈' },
  { id: 'posts', label: 'Posts', href: '/posts', icon: '📸', badge: 12 },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: '📉' },
  { id: 'audience', label: 'Audience', href: '/audience', icon: '👥' },
  { id: 'reports', label: 'Reports', href: '/reports', icon: '📋' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  items = defaultItems,
  isOpen = true,
  onToggle,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(!isOpen);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggle?.(!newState);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleToggle}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200',
          'transform transition-transform duration-300 ease-in-out',
          'z-40 md:relative md:top-0 md:translate-x-0 md:block',
          collapsed && '-translate-x-full md:translate-x-0 md:w-20',
          'overflow-y-auto',
          className
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={clsx(
            'absolute top-4 -right-12 md:static md:mt-4 md:mx-2',
            'w-10 h-10 rounded-lg',
            'bg-white border border-gray-200',
            'flex items-center justify-center',
            'text-gray-600 hover:text-gray-900',
            'transition-colors duration-200',
            'md:w-full md:mb-4'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>

        {/* Navigation Items */}
        <nav className="px-2 py-4 md:px-3">
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  'transition-colors duration-200',
                  'relative group',
                  item.active
                    ? 'bg-instagram-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={clsx(
                          'px-2 py-1 rounded-full text-xs font-bold',
                          item.active
                            ? 'bg-white text-instagram-primary'
                            : 'bg-red-100 text-red-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div
                    className={clsx(
                      'absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded',
                      'whitespace-nowrap opacity-0 pointer-events-none',
                      'group-hover:opacity-100 transition-opacity',
                      'z-50'
                    )}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer Section */}
        <div className={clsx('border-t border-gray-200 p-4 mt-auto')}>
          <button
            className={clsx(
              'w-full py-2 px-4 rounded-lg',
              'bg-gray-100 hover:bg-gray-200',
              'text-gray-700 text-sm font-medium',
              'transition-colors duration-200',
              collapsed && 'p-2 text-center'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            {collapsed ? '→' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
