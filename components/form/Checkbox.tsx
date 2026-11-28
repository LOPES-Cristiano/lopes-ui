'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import { useAccessControl } from '../useAccessControl';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement> | { target: { checked: boolean } }) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  ariaLabel?: string;
  'aria-label'?: string;
  title?: string;
  id?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

/** Checkbox unitário para controles compactos ou com label embutido. */
export default function Checkbox({
  checked: controlledChecked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  onCheckedChange,
  onChange,
  onClick,
  label: labelText,
  description,
  ariaLabel,
  'aria-label': ariaLabelProp,
  title,
  id,
  name,
  size = 'sm',
  className,
  componentId,
  hideIfDenied = false,
}: CheckboxProps) {
  const { canAccess } = useAccessControl();
  const prefersReducedMotion = useReducedMotion();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || !hasPermission;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const selected = isChecked || indeterminate;
  const computedAriaLabel =
    ariaLabel || ariaLabelProp || (typeof labelText === 'string' ? labelText : title) || 'checkbox';

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const dimensions =
    size === 'lg'
      ? 'h-7 w-7 min-h-[28px] min-w-[28px]'
      : size === 'md'
        ? 'h-6 w-6 min-h-[24px] min-w-[24px]'
        : 'h-[18px] w-[18px] min-h-[18px] min-w-[18px]';
  const iconSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (effectiveDisabled) return;
    onClick?.(e);
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
    onChange?.({ target: { checked: next } });
  };

  const hiddenInput = name ? (
    <input
      type="checkbox"
      name={name}
      checked={isChecked}
      onChange={() => {}}
      disabled={effectiveDisabled}
      tabIndex={-1}
      aria-hidden="true"
      className="sr-only pointer-events-none"
    />
  ) : null;

  const checkboxButton = (
    <button
      id={id}
      data-component-id={
        componentId ??
        `erp.checkbox.${computedAriaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      }
      
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : isChecked}
      aria-label={computedAriaLabel}
      title={title}
      disabled={effectiveDisabled}
      onClick={handleClick}
      className={twMerge(
        'inline-flex items-center justify-center p-0 box-border rounded-md border transition-[background-color,border-color,color,box-shadow,transform] duration-150 cursor-pointer shrink-0 select-none active:scale-95 motion-reduce:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        dimensions,
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-control)]'
          : 'border-input-border bg-input text-transparent hover:border-border-strong',
        effectiveDisabled && 'cursor-not-allowed opacity-40 pointer-events-none',
        !labelText && className
      )}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="block shrink-0"
      >
        {indeterminate ? (
          <motion.path
            key="checkbox-indeterminate"
            d="M3.5 8H12.5"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : isChecked ? (
          <motion.path
            key="checkbox-check"
            d="M3.2 8.4L6.4 11.6L12.8 4.8"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </svg>
    </button>
  );

  if (!labelText && !description) {
    return hiddenInput ? (
      <>
        {checkboxButton}
        {hiddenInput}
      </>
    ) : (
      checkboxButton
    );
  }

  return (
    <label
      className={twMerge(
        'inline-flex min-h-6 items-start gap-2.5 py-0.5 cursor-pointer select-none text-xs font-medium text-foreground',
        effectiveDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {checkboxButton}
      {hiddenInput}
      <div className="space-y-0.5 leading-snug pt-0.5">
        {labelText && <span className="block font-semibold text-foreground">{labelText}</span>}
        {description && (
          <span className="block text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>
    </label>
  );
}

