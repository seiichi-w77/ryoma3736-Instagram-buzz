'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

/**
 * Header component for the main navigation
 * Displays logo, title, and navigation links
 */
interface HeaderProps {
  /** Optional CSS classes */
  className?: string;
  /** Show search bar in header */
  showSearch?: boolean;
  /** Header title */
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  className,
  showSearch = false,
  title = 'Instagram Buzz',
}) => {
  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full bg-white shadow-sm',
        'border-b border-gray-200',
        className
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'w-8 h-8 rounded-lg',
                'bg-gradient-to-br from-instagram-primary via-instagram-secondary to-instagram-tertiary',
                'flex items-center justify-center text-white font-bold text-lg'
              )}
            >
              IB
            </div>
            <Link href="/" className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <span className="text-xs text-gray-500">Analytics Platform</span>
            </Link>
          </div>

          {/* Center - Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 mx-8 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search posts, hashtags..."
                  className={clsx(
                    'w-full px-4 py-2 rounded-full',
                    'bg-gray-100 border border-gray-200',
                    'focus:bg-white focus:outline-none focus:ring-2 focus:ring-instagram-primary',
                    'text-sm text-gray-900 placeholder-gray-500',
                    'transition-colors duration-200'
                  )}
                />
              </div>
            </div>
          )}

          {/* Right - Navigation Links */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className={clsx(
                'text-sm font-medium text-gray-700',
                'hover:text-instagram-primary',
                'transition-colors duration-200'
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/analytics"
              className={clsx(
                'text-sm font-medium text-gray-700',
                'hover:text-instagram-primary',
                'transition-colors duration-200'
              )}
            >
              Analytics
            </Link>
            <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-gray-200">
              <button
                className={clsx(
                  'w-8 h-8 rounded-full',
                  'bg-gray-100 hover:bg-gray-200',
                  'flex items-center justify-center',
                  'text-gray-600',
                  'transition-colors duration-200'
                )}
                aria-label="Notifications"
              >
                <span className="text-sm">🔔</span>
              </button>
              <button
                className={clsx(
                  'w-8 h-8 rounded-full',
                  'bg-gradient-to-br from-instagram-primary to-instagram-secondary',
                  'flex items-center justify-center',
                  'text-white font-bold text-xs',
                  'hover:shadow-md',
                  'transition-shadow duration-200'
                )}
                aria-label="User profile"
              >
                U
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
