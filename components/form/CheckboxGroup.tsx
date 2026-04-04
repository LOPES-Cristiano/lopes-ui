"use client";

import React, { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

export type CheckboxOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type CheckboxGroupProps = Omit<FieldWrapperProps, "children"> & {
  name?: string;
  options: CheckboxOption[];
  /** Controlled selected values */
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** If true, multiple options can be selected simultaneously */
  multiple?: boolean;
  /** Visual shape of the indicator */
  shape?: "square" | "circle";
  /** Layout direction */
  direction?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  componentId?: string;
};

const SZ = {
  sm: { box: "h-4 w-4",   dot: "h-2 w-2",     iconSz: 9,  text: "text-sm",  desc: "text-xs",  gap: "gap-2",   radius: "rounded" },
  md: { box: "h-5 w-5",   dot: "h-2.5 w-2.5", iconSz: 11, text: "text-sm",  desc: "text-xs",  gap: "gap-2.5", radius: "rounded-[5px]" },
  lg: { box: "h-6 w-6",   dot: "h-3 w-3",     iconSz: 13, text: "text-base",desc: "text-sm",  gap: "gap-3",   radius: "rounded-md" },
} as const;

export default function CheckboxGroup({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  name, options,
  value: controlledValue,
  defaultValue,
  onChange,
  multiple = true,
  shape = "square",
  direction = "vertical",
  size = "md",
  componentId,
}: CheckboxGroupProps) {
  const groupId = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selected = controlledValue ?? internalValue;

  const toggle = (val: string) => {
    let next: string[];
    if (multiple) {
      next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
    } else {
      // radio-like: only one active; clicking active deselects
      next = selected.includes(val) ? [] : [val];
    }
    if (!controlledValue) setInternalValue(next);
    onChange?.(next);
  };

  const sz = SZ[size];

  return (
    <FieldWrapper
      label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={helpText}
      width={width} className={className}
    >
      <div
        role={multiple ? "group" : "radiogroup"}
        className={twMerge(
          "flex",
          direction === "horizontal" ? "flex-row flex-wrap gap-x-5 gap-y-2.5" : "flex-col gap-2.5",
        )}
        {...(componentId ? { "data-component-id": componentId } as any : {})}
      >
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          const optId = `${groupId}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={twMerge(
                "group/cb flex cursor-pointer select-none",
                sz.gap,
                opt.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {/* Hidden native input — drives focus-visible ring via peer */}
              <input
                id={optId}
                type={multiple ? "checkbox" : "radio"}
                name={name ?? groupId}
                value={opt.value}
                checked={checked}
                disabled={opt.disabled}
                onChange={() => toggle(opt.value)}
                className="peer sr-only"
              />

              {/* Custom visual indicator */}
              <span
                aria-hidden="true"
                className={twMerge(
                  "relative mt-px shrink-0 flex items-center justify-center",
                  "border-2 transition-all duration-200 ease-out",
                  // Focus visible ring via peer
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-1",
                  sz.box,
                  shape === "circle"
                    ? twMerge(
                        "rounded-full",
                        checked
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-zinc-300 bg-white group-hover/cb:border-indigo-400",
                      )
                    : twMerge(
                        sz.radius,
                        checked
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-zinc-300 bg-white group-hover/cb:border-indigo-400",
                      ),
                )}
              >
                {shape === "circle" ? (
                  <span
                    className={twMerge(
                      "rounded-full bg-indigo-600 transition-all duration-200 ease-out",
                      sz.dot,
                      checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
                    )}
                  />
                ) : (
                  <span
                    className={twMerge(
                      "text-white transition-all duration-200 ease-out",
                      checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
                    )}
                  >
                    <Check size={sz.iconSz} strokeWidth={3} />
                  </span>
                )}
              </span>

              {/* Label text */}
              <span className="flex flex-col gap-0.5">
                <span className={twMerge(sz.text, "font-medium text-zinc-800 leading-snug")}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className={twMerge(sz.desc, "text-zinc-400 leading-snug")}>
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
