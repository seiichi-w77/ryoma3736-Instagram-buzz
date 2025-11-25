'use client';

import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Button component variant type
 */
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';

/**
 * Button component size type
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading state */
  isLoading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Left icon/element */
  leftIcon?: React.ReactNode;
  /** Right icon/element */
  rightIcon?: React.ReactNode;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Reusable Button component with multiple variants and sizes
 * Supports Instagram gradient theming
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const variantClasses: Record<ButtonVariant, string> = {
      primary: clsx(
        'bg-gradient-to-r from-instagram-primary to-instagram-secondary',
        'text-white hover:shadow-lg',
        'active:opacity-90'
      ),
      secondary: clsx(
        'bg-gray-200 text-gray-900',
        'hover:bg-gray-300',
        'active:bg-gray-400'
      ),
      tertiary: clsx(
        'bg-transparent border border-gray-300 text-gray-900',
        'hover:bg-gray-50 hover:border-gray-400',
        'active:bg-gray-100'
      ),
      danger: clsx(
        'bg-red-600 text-white',
        'hover:bg-red-700 hover:shadow-lg',
        'active:opacity-90'
      ),
      success: clsx(
        'bg-green-600 text-white',
        'hover:bg-green-700 hover:shadow-lg',
        'active:opacity-90'
      ),
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center gap-2',
          'font-medium rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-instagram-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="animate-spin">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
