"use client";

import { useDataSections } from "@/app/components/demos/data";

export default function Page() {
  const sections = useDataSections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
        {sections["activity-feed"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["filter-bar"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["datatable"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["inbox-list"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["kanban-board"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["tables"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["treeview"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Spreadsheet ──────────────────────────────────────────── */}
        {sections["spreadsheet"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TransferList ─────────────────────────────────────────── */}
        {sections["transfer-list"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Chart (Bar, Area, Line, Donut) ───────────────────────── */}
        {sections["charts"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── DescriptionList ──────────────────────────────────────── */}
        {sections["description-list"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── JsonViewer ───────────────────────────────────────────── */}
        {sections["json-viewer"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Barcode (Code-128 SVG) ───────────────────────────────── */}
        {sections["barcode"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
