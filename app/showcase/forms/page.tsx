"use client";

import { useFormsSections } from "@/app/components/demos/forms";

export default function Page() {
  const sections = useFormsSections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
        {sections["forms"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["login-form"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["otp-input"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["password-strength"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["price-input"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["rich-text-editor"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TextareaField ────────────────────────────────────────────── */}
        {sections["textarea-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── RadioGroupField ──────────────────────────────────────────── */}
        {sections["radio-group-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SegmentedControl ─────────────────────────────────────────── */}
        {sections["segmented-control"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SliderField ──────────────────────────────────────────────── */}
        {sections["slider-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── InputGroup ───────────────────────────────────────────────── */}
        {sections["input-group"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── DateRangePickerField ─────────────────────────────────────── */}
        {sections["date-range-picker"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── RatingField ──────────────────────────────────────────────── */}
        {sections["rating-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FilterChips ──────────────────────────────────────────────── */}
        {sections["filter-chips"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TagsInput, TagInputField & CheckableTagGroup ─────────────── */}
        {sections["tags-input"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── MentionsField ────────────────────────────────────────────── */}
        {sections["mentions-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── ColorPickerField ─────────────────────────────────────────── */}
        {sections["color-picker-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── CascaderField ────────────────────────────────────────────── */}
        {sections["cascader-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TreeSelectField ──────────────────────────────────────────── */}
        {sections["tree-select-field"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FileDropzone ─────────────────────────────────────────────── */}
        {sections["file-dropzone"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SignaturePad & SignatureField ────────────────────────────── */}
        {sections["signature-pad"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── InlineEdit ───────────────────────────────────────────────── */}
        {sections["inline-edit"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FieldSet & FieldGroup ────────────────────────────────────── */}
        {sections["field-set"]}
      </div>
    </main>
  );
}
