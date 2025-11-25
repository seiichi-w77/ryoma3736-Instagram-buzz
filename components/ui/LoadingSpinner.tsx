'use client';

import React from 'react';
import clsx from 'clsx';

/**
 * Loading spinner size type
 */
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Loading spinner variant type
 */
type SpinnerVariant = 'default' | 'gradient' | 'pulse';

/**
 * Loading spinner component props
 */
interface LoadingSpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Spinner variant style */
  variant?: SpinnerVariant;
  /** Show loading text */
  showText?: boolean;
  /** Custom loading text */
  text?: string;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Reusable Loading Spinner component
 * Supports multiple sizes and animation variants
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  showText = false,
  text = 'Loading...',
  className,
}) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const svgSizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses: Record<SpinnerSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const strokeWidthClasses: Record<SpinnerSize, string> = {
    sm: 'stroke-[3]',
    md: 'stroke-[2.5]',
    lg: 'stroke-[2]',
    xl: 'stroke-[2]',
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      {variant === 'default' && (
        <svg
          className={clsx(
            svgSizeClasses[size],
            strokeWidthClasses[size],
            'text-gray-300 animate-spin'
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {variant === 'gradient' && (
        <svg
          className={clsx(
            svgSizeClasses[size],
            'animate-spin'
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <defs>
            <linearGradient
              id="instagram-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#E4405F" />
              <stop offset="50%" stopColor="#833AB4" />
              <stop offset="100%" stopColor="#F77737" />
            </linearGradient>
          </defs>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="url(#instagram-gradient)"
            strokeWidth="2"
          />
          <path
            fill="url(#instagram-gradient)"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {variant === 'pulse' && (
        <div
          className={clsx(
            sizeClasses[size],
            'rounded-full',
            'bg-gradient-to-r from-instagram-primary via-instagram-secondary to-instagram-tertiary',
            'animate-pulse'
          )}
        />
      )}

      {showText && (
        <p className={clsx(
          'mt-4 text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Full-screen loading overlay component
 */
interface LoadingOverlayProps {
  /** Show overlay */
  isOpen?: boolean;
  /** Optional CSS classes */
  className?: string;
  /** Loading text */
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen = false,
  className,
  text = 'Loading...',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50',
        'bg-black bg-opacity-50 backdrop-blur-sm',
        'flex items-center justify-center',
        className
      )}
    >
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <LoadingSpinner
          size="lg"
          variant="gradient"
          showText
          text={text}
        />
      </div>
    </div>
  );
};

/**
 * Skeleton loader component for content placeholders
 */
interface SkeletonProps {
  /** Skeleton width */
  width?: string | number;
  /** Skeleton height */
  height?: string | number;
  /** Show circle shape */
  circle?: boolean;
  /** Number of lines (for text skeleton) */
  lines?: number;
  /** Optional CSS classes */
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  circle = false,
  lines = 1,
  className,
}) => {
  if (lines && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'bg-gray-200 animate-pulse rounded',
              i === lines - 1 && 'w-4/5'
            )}
            style={{
              height: typeof height === 'number' ? `${height}px` : height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'bg-gray-200 animate-pulse',
        circle ? 'rounded-full' : 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
};

export default LoadingSpinner;
