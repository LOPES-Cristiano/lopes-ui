"use client";

import { useCommunicationSections } from "@/app/components/demos/communication";

export default function Page() {
  const sections = useCommunicationSections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          {sections["chat"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["email-composer"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["notification-bell"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["interactions"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
