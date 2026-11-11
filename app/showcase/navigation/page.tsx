"use client";

import { useNavigationSections } from "@/app/components/demos/navigation";

export default function Page() {
  const sections = useNavigationSections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          {sections["accordion"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["app-launcher"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["breadcrumb"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["command-menu"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["header"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["page-header"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["quick-actions"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["shortcut-hint"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["sidebar"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["split-pane"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["footer"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          {sections["tabs"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Pagination ────────────────────────────────────────────── */}
          {sections["pagination"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Dock ──────────────────────────────────────────────────── */}
          {sections["dock"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Collapsible, Separator, ScrollArea & Kbd ──────────────── */}
          {sections["collapsible-separator-scroll-kbd"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── TableOfContents (Mantine UI Scroll-Spy) ──────────────── */}
          {sections["table-of-contents"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
