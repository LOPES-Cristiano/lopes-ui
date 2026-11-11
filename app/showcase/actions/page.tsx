"use client";

import { useActionsSections } from "@/app/components/demos/actions";

export default function Page() {
  const sections = useActionsSections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
        {sections["button"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["action-button"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── ButtonGroup ──────────────────────────────────────────────── */}
        {sections["button-group"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Toggle & ToggleGroup ─────────────────────────────────────── */}
        {sections["toggle-group"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["alerts"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["confirm-dialog"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["drawer"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["modals"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["empty-state"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["status-pages"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {sections["toasts"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Popconfirm ───────────────────────────────────────────────── */}
        {sections["popconfirm"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── PasswordConfirmDialog ────────────────────────────────────── */}
        {sections["password-confirm"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Result ───────────────────────────────────────────────────── */}
        {sections["result"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SpeedDial (FAB) ──────────────────────────────────────────── */}
        {sections["speed-dial"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FloatButton, FloatButtonGroup & BackTop ──────────────────── */}
        {sections["float-button"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Loading & Spin ───────────────────────────────────────────── */}
        {sections["loading"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SortableList ─────────────────────────────────────────────── */}
        {sections["sortable-list"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── PullToRefresh ────────────────────────────────────────────── */}
        {sections["pull-to-refresh"]}

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Swap ─────────────────────────────────────────────────────── */}
        {sections["swap"]}
      </div>
    </main>
  );
}
