"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Brand from "@/components/header/Brand";
import Nav, { type NavItem } from "@/components/header/Nav";
import SearchInput from "@/components/header/SearchInput";
import ProfileMenu from "@/components/header/ProfileMenu";
import { useShell } from "@/components/ShellContext";

type HeaderProps = {
  componentId?: string;
  nav?: NavItem[];
  brand?: React.ReactNode;
  search?: React.ReactNode;
  profile?: React.ReactNode;
  navDropdown?: boolean;
  sticky?: boolean;
};

export default function Header({ nav, brand, search, profile, componentId, navDropdown = false, sticky = true, onNavigate }: HeaderProps & { onNavigate?: (href: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shell = useShell();
  const hasSidebar = !!shell?.hasSidebar;
  const sidebarMounted = !!shell?.sidebarMounted;
  const sidebarCollapsed = shell?.sidebarCollapsed ?? false;

  // When a sidebar is mounted, mobile hamburger opens the sidebar drawer.
  // When hasSidebar (SSR hint) but no sidebar is actually mounted (e.g. 404 page),
  // fall back to the local mobile panel.
  const useDrawer = hasSidebar && sidebarMounted;
  const isMobileOpen = useDrawer ? (shell?.mobileSidebarOpen ?? false) : mobileOpen;
  const toggleMobile = () => {
    if (useDrawer) shell?.setMobileSidebarOpen(!isMobileOpen);
    else setMobileOpen((s) => !s);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = [
    "z-10 w-full border-b transition-colors duration-300",
    sticky ? "sticky top-0" : "relative",
    scrolled
      ? "bg-white/90 backdrop-blur-md border-zinc-100/60"
      : "bg-white/90 backdrop-blur-sm border-zinc-100",
  ].join(" ");

  return (
    <header
      className={headerClass}
      {...(componentId ? { ['data-component-id']: componentId } as any : {})}
    >
      {hasSidebar ? (
        /* ── Fused layout ────────────────────────────────────────────────── */
        <>
          {/* ── Mobile row (< md): brand + hamburger only, no sidebar area ── */}
          <div className="flex h-16 w-full items-center justify-between px-4 md:hidden">
            {brand ?? null}
            {/* Only show hamburger if there's nav content to open */}
            {(sidebarMounted || (nav && nav.length > 0)) && (
              <button
                aria-label="Abrir menu"
                onClick={toggleMobile}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>

          {/* ── Desktop row (≥ md): sidebar-mirrored brand + content ──────── */}
          <div className="hidden md:flex h-16 w-full">
            {/* Brand section — mirrors sidebar width */}
            <div
              className={[
                "flex shrink-0 items-center gap-2 border-r border-zinc-100/80 transition-[width] duration-300 overflow-hidden",
                sidebarCollapsed ? "w-[4.5rem] justify-center px-0" : "w-64 justify-between px-4",
              ].join(" ")}
            >
              {!sidebarCollapsed && (brand ?? null)}
              <button
                type="button"
                onClick={() => shell?.toggleSidebar()}
                title={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
            </div>

            {/* Content section */}
            <div className="flex flex-1 items-center justify-between px-4 sm:px-6 min-w-0">
              {nav && nav.length ? <Nav items={nav} onNavigate={onNavigate} dropdown={navDropdown} /> : null}
              <div className="flex items-center gap-3">
                {search ?? null}
                {profile ?? null}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── Standard layout ─────────────────────────────────────────────── */
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {brand ?? null}
            {nav && nav.length ? (
              <div className="hidden md:block">
                <Nav items={nav} onNavigate={onNavigate} dropdown={navDropdown} />
              </div>
            ) : null}
            <div className="flex items-center gap-3">
              {search ?? null}
              {profile ?? null}
              <button
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                onClick={toggleMobile}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav panel — shown when no sidebar is mounted (e.g. 404 page) and there is nav */}
      {!useDrawer && mobileOpen && nav && nav.length > 0 && (
        <div className="md:hidden border-t border-zinc-100 bg-white/95 backdrop-blur-sm">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {nav.map((n, idx) => (
              <a
                key={`${n.href ?? "#"}-${n.label}-${idx}`}
                href={n.href ?? "#"}
                onClick={(e) => {
                  if (onNavigate && n.href) {
                    e.preventDefault();
                    onNavigate(n.href);
                  }
                  setMobileOpen(false);
                }}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
