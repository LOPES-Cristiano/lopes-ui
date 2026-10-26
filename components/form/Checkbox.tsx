'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

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
  size = 'sm',
  className,
  componentId,
  hideIfDenied,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const selected = isChecked || indeterminate;
  const computedAriaLabel =
    ariaLabel || ariaLabelProp || (typeof labelText === 'string' ? labelText : title) || 'checkbox';

  const dimensions =
    size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-6 w-6' : 'h-4.5 w-4.5 min-h-[18px] min-w-[18px]';
  const iconSize = size === 'lg' ? 17 : size === 'md' ? 15 : 12;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
    onChange?.({ target: { checked: next } } as any);
  };

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
      disabled={disabled}
      onClick={handleClick}
      className={twMerge(
        'inline-flex items-center justify-center rounded-md border transition-all duration-150 cursor-pointer shrink-0 select-none',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
        dimensions,
        selected
          ? 'border-primary bg-primary text-white shadow-xs shadow-primary/20'
          : 'border-zinc-300 bg-white text-transparent hover:border-primary/60 dark:border-zinc-600 dark:bg-zinc-900',
        disabled && 'cursor-not-allowed opacity-40 pointer-events-none',
        !labelText && className
      )}
    >
      {indeterminate ? (
        <Minus size={iconSize} strokeWidth={3} />
      ) : isChecked ? (
        <Check size={iconSize} strokeWidth={3} />
      ) : null}
    </button>
  );

  if (!labelText && !description) {
    return checkboxButton;
  }

  return (
    <label
      className={twMerge(
        'inline-flex items-start gap-2.5 cursor-pointer select-none text-xs font-medium text-foreground',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {checkboxButton}
      <div className="space-y-0.5 leading-snug pt-0.5">
        {labelText && <span className="block font-semibold text-foreground">{labelText}</span>}
        {description && (
          <span className="block text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>
    </label>
  );
}

