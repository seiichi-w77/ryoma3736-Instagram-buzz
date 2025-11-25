'use client';

import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Input component type
 */
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';

/**
 * Input component size type
 */
type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input component props
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input type */
  type?: InputType;
  /** Input size */
  inputSize?: InputSize;
  /** Label text */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Left icon/element */
  leftIcon?: React.ReactNode;
  /** Right icon/element */
  rightIcon?: React.ReactNode;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Reusable Input component with label and error support
 * Supports multiple sizes and icon placement
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      inputSize = 'md',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses: Record<InputSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const iconPaddingClasses: Record<InputSize, string> = {
      sm: clsx(leftIcon && 'pl-9', rightIcon && 'pr-9'),
      md: clsx(leftIcon && 'pl-10', rightIcon && 'pr-10'),
      lg: clsx(leftIcon && 'pl-12', rightIcon && 'pr-12'),
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={clsx(
                'absolute left-0 top-0 bottom-0',
                'flex items-center justify-center',
                'text-gray-400 pointer-events-none',
                inputSize === 'sm' && 'w-8 pl-2',
                inputSize === 'md' && 'w-10 pl-3',
                inputSize === 'lg' && 'w-12 pl-4'
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={clsx(
              'w-full rounded-lg border-2 transition-colors duration-200',
              'focus:outline-none focus:ring-0',
              'placeholder-gray-400 text-gray-900',
              'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
              sizeClasses[inputSize],
              iconPaddingClasses[inputSize],
              error
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-instagram-primary bg-white',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={clsx(
                'absolute right-0 top-0 bottom-0',
                'flex items-center justify-center',
                'text-gray-400 pointer-events-none',
                inputSize === 'sm' && 'w-8',
                inputSize === 'md' && 'w-10',
                inputSize === 'lg' && 'w-12'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={clsx(
              'text-sm mt-2',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component props
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text */
  label?: string;
  /** Helper text below textarea */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Textarea rows */
  rows?: number;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Textarea component
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      disabled,
      className,
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={clsx(
            'w-full rounded-lg border-2 transition-colors duration-200',
            'focus:outline-none focus:ring-0',
            'placeholder-gray-400 text-gray-900',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
            'px-4 py-2 resize-none',
            error
              ? 'border-red-300 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-instagram-primary bg-white',
            className
          )}
          {...props}
        />

        {(error || helperText) && (
          <p
            className={clsx(
              'text-sm mt-2',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
