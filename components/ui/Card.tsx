'use client';

import React from 'react';
import clsx from 'clsx';

/**
 * Card component variant type
 */
type CardVariant = 'default' | 'elevated' | 'outlined';

/**
 * Card component props
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant style */
  variant?: CardVariant;
  /** Show hover effect */
  hoverable?: boolean;
  /** Optional CSS classes */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * Reusable Card component for content containers
 * Supports multiple variants and hover effects
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverable = false,
  className,
  children,
  ...props
}) => {
  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-white shadow-card border border-gray-200',
    elevated: clsx(
      'bg-white shadow-card-hover',
      'border border-gray-100'
    ),
    outlined: clsx(
      'bg-white border-2 border-gray-200',
      'shadow-none'
    ),
  };

  return (
    <div
      className={clsx(
        'rounded-lg p-6',
        variantClasses[variant],
        'transition-all duration-200',
        hoverable && 'hover:shadow-card-hover hover:border-gray-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card header component
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header title */
  title?: string;
  /** Header subtitle/description */
  subtitle?: string;
  /** Right side content (e.g., buttons) */
  rightContent?: React.ReactNode;
  /** Optional CSS classes */
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  rightContent,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'flex items-start justify-between mb-4',
        'pb-4 border-b border-gray-100',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {rightContent && (
        <div className="flex-shrink-0 ml-4">
          {rightContent}
        </div>
      )}
    </div>
  );
};

/**
 * Card body component
 */
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional CSS classes */
  className?: string;
  /** Body content */
  children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx('py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card footer component
 */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional CSS classes */
  className?: string;
  /** Footer content */
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'mt-4 pt-4 border-t border-gray-100',
        'flex items-center justify-between gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card grid wrapper component
 */
interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (responsive) */
  cols?: 1 | 2 | 3 | 4;
  /** Optional CSS classes */
  className?: string;
  /** Grid content */
  children: React.ReactNode;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cols = 3,
  className,
  children,
  ...props
}) => {
  const colsClass: Record<1 | 2 | 3 | 4, string> = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2 grid-cols-1',
    3: 'sm:grid-cols-2 lg:grid-cols-3 grid-cols-1',
    4: 'sm:grid-cols-2 lg:grid-cols-4 grid-cols-1',
  };

  return (
    <div
      className={clsx(
        'grid gap-6',
        colsClass[cols],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
