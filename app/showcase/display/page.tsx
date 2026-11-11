"use client";

import { useDisplaySections } from "@/app/components/demos/display";

export default function Page() {
  const sections = useDisplaySections();
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          {sections["avatars"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["badges"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["cards"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["carousel"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["ping-indicator"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["service-status"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {sections["stat-card"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Calendar ──────────────────────────────────────────────── */}
          {sections["calendar"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Badge ───────────────────────────────────────────── */}
          {sections["status-badge"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── DetailLayout ──────────────────────────────────────────── */}
          {sections["detail-layout"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── EmojiPicker ───────────────────────────────────────────── */}
          {sections["emoji-picker"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Progress & RadialProgress ─────────────────────────────── */}
          {sections["progress"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── HoverCard ─────────────────────────────────────────────── */}
          {sections["hover-card"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Item & ItemGroup ──────────────────────────────────────── */}
          {sections["item-list"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Countdown ─────────────────────────────────────────────── */}
          {sections["countdown"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Diff (Before / After) ─────────────────────────────────── */}
          {sections["diff"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── HoverGallery & Hover3DCard ────────────────────────────── */}
          {sections["hover-gallery"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Indicator, Stack, Mask & AspectRatio ──────────────────── */}
          {sections["indicator-stack-mask"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Mockups (Browser, Phone, Code) ────────────────────────── */}
          {sections["mockups"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── BentoGrid & BentoCard ─────────────────────────────────── */}
          {sections["bento-grid"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── ActionGridCard & SwitchesCard (Mantine UI) ───────────── */}
          {sections["action-grid-switches"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Callout, Spoiler & HighlightText ─────────────────────── */}
          {sections["callout-spoiler-highlight"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── ImageLightbox ────────────────────────────────────────── */}
          {sections["image-lightbox"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── QRCode (ISO/IEC 18004 Pure TS Encoder) ───────────────── */}
          {sections["qrcode"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Watermark ────────────────────────────────────────────── */}
          {sections["watermark"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Skeleton Compound Suite ──────────────────────────────── */}
          {sections["skeleton-suite"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Masonry Waterfall Layout ─────────────────────────────── */}
          {sections["masonry"]}

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
