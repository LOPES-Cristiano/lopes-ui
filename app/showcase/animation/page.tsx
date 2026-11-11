"use client";

import { useAnimationSections } from "@/app/components/demos/animation";

export default function Page() {
  const sections = useAnimationSections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
        {/* ── CodeBlock ────────────────────────────────────────────── */}
        {sections["codeblock"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Snippet & CopyButton ─────────────────────────────────── */}
        {sections["snippet"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── CodeEditor ──────────────────────────────────────────── */}
        {sections["code-editor"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Stepper ──────────────────────────────────────────────── */}
        {sections["stepper"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Timeline ─────────────────────────────────────────────── */}
        {sections["timeline"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Tour ─────────────────────────────────────────────────── */}
        {sections["tour"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TextRotate ───────────────────────────────────────────── */}
        {sections["text-rotate"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Marquee ──────────────────────────────────────────────── */}
        {sections["marquee"]}
      </div>
    </main>
  );
}
