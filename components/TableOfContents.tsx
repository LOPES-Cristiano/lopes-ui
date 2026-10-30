"use client";

import React, { useState, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { List } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TocItem = {
  id: string;
  label: string;
  /** Heading depth (1–4). Drives left indentation. Default: 2 */
  level?: 1 | 2 | 3 | 4;
  badge?: string;
};

export type TableOfContentsVariant = "rail" | "filled" | "minimal";

export type TableOfContentsProps = {
  /** Explicit TOC items. If omitted, scans `containerRef` or `document` using `selector`. */
  items?: TocItem[];
  /** CSS selector used when auto-scanning headings. Default: "h2[id], h3[id]" */
  selector?: string;
  /** Optional scroll/content container to scan and observe */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Controlled active heading id */
  activeId?: string;
  /** Callback when an item is clicked or activated via scroll-spy */
  onActiveChange?: (id: string) => void;
  /** Header title above the links. Pass `null` to hide. Default: "Nesta página" */
  title?: React.ReactNode;
  /** Visual style inspired by Mantine UI Table of Contents. Default: "rail" */
  variant?: TableOfContentsVariant;
  /** Top offset in px for sticky headers when scrolling & spying. Default: 96 */
  scrollOffset?: number;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const INDENT_MAP: Record<1 | 2 | 3 | 4, string> = {
  1: "pl-3",
  2: "pl-3",
  3: "pl-6",
  4: "pl-9",
};

// ── Component (Mantine UI Table of Contents with animated indicator) ──────────

export default function TableOfContents({
  items: explicitItems,
  selector = "h2[id], h3[id]",
  containerRef,
  activeId: controlledActiveId,
  onActiveChange,
  title = "Nesta página",
  variant = "rail",
  scrollOffset = 96,
  className,
  componentId,
  hideIfDenied = false,
}: TableOfContentsProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [scannedItems, setScannedItems] = useState<TocItem[]>([]);
  const [internalActiveId, setInternalActiveId] = useState<string>("");
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number } | null>(null);

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const resolvedItems = explicitItems ?? scannedItems;
  const activeId = controlledActiveId ?? (internalActiveId || resolvedItems[0]?.id || "");

  // Auto-scan DOM headings if `items` is not explicitly provided
  useEffect(() => {
    if (explicitItems) return;
    const root: ParentNode = containerRef?.current ?? document;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const discovered: TocItem[] = nodes
      .filter((el) => Boolean(el.id))
      .map((el) => {
        const tag = el.tagName.toLowerCase();
        const level: 1 | 2 | 3 | 4 =
          tag === "h1" ? 1 : tag === "h3" ? 3 : tag === "h4" ? 4 : 2;
        return {
          id: el.id,
          label: (el.textContent || "").trim(),
          level,
        };
      })
      .filter((item) => item.label.length > 0);
    setScannedItems(discovered);
  }, [explicitItems, selector, containerRef]);

  // Scroll-spy tracking
  useEffect(() => {
    if (controlledActiveId !== undefined || resolvedItems.length === 0) return;

    const handleScroll = () => {
      let current = resolvedItems[0]?.id ?? "";
      for (const item of resolvedItems) {
        const target = document.getElementById(item.id);
        if (!target) continue;
        const rect = target.getBoundingClientRect();
        if (rect.top <= scrollOffset + 24) {
          current = item.id;
        }
      }
      if (current) {
        setInternalActiveId((prev) => {
          if (prev !== current) {
            onActiveChange?.(current);
            return current;
          }
          return prev;
        });
      }
    };

    handleScroll();
    const scrollTarget: HTMLElement | Window = containerRef?.current ?? window;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [resolvedItems, controlledActiveId, scrollOffset, containerRef, onActiveChange]);

  // Measure active link for sliding rail indicator
  useEffect(() => {
    if (variant !== "rail") return;
    const listEl = listRef.current;
    const activeEl = activeId ? itemRefs.current[activeId] : null;
    if (!listEl || !activeEl) {
      setIndicatorStyle(null);
      return;
    }
    const listRect = listEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    setIndicatorStyle({
      top: activeRect.top - listRect.top,
      height: activeRect.height,
    });
  }, [activeId, resolvedItems, variant]);

  if (!hasPermission && hideIfDenied) return null;
  if (resolvedItems.length === 0) return null;

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (!hasPermission) return;

    if (controlledActiveId === undefined) {
      setInternalActiveId(id);
    }
    onActiveChange?.(id);

    const target = document.getElementById(id);
    if (!target) return;

    if (containerRef?.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - 16;
      container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Sumário da página"
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col gap-2.5 text-sm",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {title !== null && (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <List size={14} className="shrink-0" />
          <span>{title}</span>
        </div>
      )}

      <div className="relative">
        {/* Vertical rail track + sliding indicator */}
        {variant === "rail" && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[2px] rounded-full bg-border"
            />
            {indicatorStyle && (
              <div
                aria-hidden="true"
                style={{
                  transform: `translateY(${indicatorStyle.top}px)`,
                  height: `${indicatorStyle.height}px`,
                }}
                className="absolute left-0 top-0 w-[2px] rounded-full bg-primary transition-[transform,height] duration-200 ease-out"
              />
            )}
          </>
        )}

        <ul ref={listRef} className="flex flex-col gap-0.5">
          {resolvedItems.map((item) => {
            const isActive = item.id === activeId;
            const level = item.level ?? 2;

            return (
              <li key={item.id}>
                <a
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(e) => handleItemClick(e, item.id)}
                  className={twMerge(
                    "group flex items-center justify-between gap-2 py-1.5 pr-2.5 text-xs transition-colors duration-150 rounded-r-lg",
                    INDENT_MAP[level],
                    variant === "filled" && "rounded-lg",
                    isActive
                      ? variant === "filled"
                        ? "bg-primary/10 font-semibold text-primary"
                        : "font-semibold text-primary"
                      : "text-muted-foreground hover:text-foreground",
                    variant === "filled" && !isActive && "hover:bg-muted/60",
                  )}
                >
                  <span className="truncate leading-snug">{item.label}</span>
                  {item.badge && (
                    <span
                      className={twMerge(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export { TableOfContents };
