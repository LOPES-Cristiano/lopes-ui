"use client";

import React, { useId } from "react";
import FieldWrapper, { type FieldWrapperProps } from "./form/FieldWrapper";
import RichTextEditor, {
  type RichTextEditorProps,
  type RichTextEditorRef,
} from "./RichTextEditor";
import { useAccessControl } from "./useAccessControl";

export type RichTextFieldProps = Omit<RichTextEditorProps, "error"> &
  Pick<
    FieldWrapperProps,
    | "label"
    | "labelInline"
    | "orientation"
    | "labelWidth"
    | "required"
    | "tooltip"
    | "labelAction"
    | "helpText"
    | "hint"
    | "width"
  > & {
    id?: string;
    name?: string;
    /** Validation error message displayed below the editor */
    error?: string;
    /**
     * When true (default), empty Tiptap markup (`<p></p>`, `<p><br></p>`) is normalized
     * to `""` in `onChange` so Zod `.min(1)` required checks work accurately.
     */
    normalizeEmptyHtml?: boolean;
    wrapperClassName?: string;
    ref?: React.Ref<RichTextEditorRef>;
  };

function isEffectivelyEmptyHtml(html: string): boolean {
  const stripped = html
    .replace(/<img\b[^>]*>/gi, "IMG")
    .replace(/<table\b[^>]*>/gi, "TABLE")
    .replace(/<hr\b[^>]*>/gi, "HR")
    .replace(/<span[^>]*data-merge-tag[^>]*>/gi, "VAR")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return stripped.length === 0;
}

export default function RichTextField({
  id,
  name,
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
  width,
  normalizeEmptyHtml = true,
  wrapperClassName,
  onChange,
  disabled,
  componentId,
  hideIfDenied = false,
  ref,
  ...editorProps
}: RichTextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const effectiveDisabled = Boolean(disabled || (!hasPermission && !hideIfDenied));

  const handleChange = (html: string) => {
    if (!onChange) return;
    if (normalizeEmptyHtml && isEffectivelyEmptyHtml(html)) {
      onChange("");
    } else {
      onChange(html);
    }
  };

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={wrapperClassName}
    >
      {name ? <input type="hidden" name={name} value={editorProps.value ?? ""} /> : null}
      <RichTextEditor
        ref={ref}
        {...editorProps}
        disabled={effectiveDisabled}
        error={Boolean(error)}
        onChange={handleChange}
        componentId={componentId}
        hideIfDenied={hideIfDenied}
      />
    </FieldWrapper>
  );
}
