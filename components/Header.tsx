"use client";

import React, { useEffect, useState } from "react";
import { Menu, PanelLeft, PanelLeftClose, X } from "lucide-react";
import Nav, { type NavItem } from "./header/Nav";
import { useShell } from "./ShellContext";
import Button from "./Button";

export type HeaderProps = {
  componentId?: string;
  nav?: NavItem[];
  brand?: React.ReactNode;
  search?: React.ReactNode;
  extra?: React.ReactNode;
  profile?: React.ReactNode;
  navDropdown?: boolean;
  sticky?: boolean;
  hideMobileMenu?: boolean;
};

export default function Header({
  nav,
  brand,
  search,
  extra,
  profile,
  componentId,
  navDropdown = false,
  sticky = true,
  hideMobileMenu = false,
  onNavigate,
}: HeaderProps & { onNavigate?: (href: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shell = useShell();
  const hasSidebar = !!shell?.hasSidebar;
  const sidebarMounted = !!shell?.sidebarMounted;
  const sidebarCollapsed = !!shell?.sidebarCollapsed;

  const useDrawer = hasSidebar && sidebarMounted;
  const isMobileOpen = useDrawer ? (shell?.mobileSidebarOpen ?? false) : mobileOpen;
  const toggleMobile = () => {
    if (useDrawer) shell?.setMobileSidebarOpen(!isMobileOpen);
    else setMobileOpen((value) => !value);
  };
  const toggleSidebar = () => shell?.toggleSidebar();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = [
    "z-40 w-full border-b shadow-[var(--header-shadow)] transition-colors duration-150",
    sticky ? "sticky top-0" : "relative",
    scrolled
      ? "bg-header/95 text-header-foreground backdrop-blur-md max-md:backdrop-blur-none border-header-border"
      : "bg-header text-header-foreground backdrop-blur-sm max-md:backdrop-blur-none border-header-border",
  ].join(" ");

  return (
    <header
      className={headerClass}
      {...(componentId ? { ["data-component-id"]: componentId } : {})}
    >
      {hasSidebar ? (
        <>
          <div className="flex h-16 w-full items-center justify-between gap-2 px-3 sm:px-4 md:hidden">
            <div className="flex min-w-0 items-center gap-2">
              {!hideMobileMenu && (sidebarMounted || (nav && nav.length > 0)) && (
                <button
                  data-component-id="erp.header.mobile-toggle"
                  type="button"
                  aria-label="Abrir menu"
                  onClick={toggleMobile}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-header-control-border bg-header-control text-header-control-foreground hover:bg-header-control-hover hover:text-header-control-hover-foreground transition-colors cursor-pointer"
                >
                  {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}
              {brand ?? null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {extra ?? null}
              {profile ?? null}
            </div>
          </div>
          <div className="hidden h-16 w-full md:flex">
            <div className="flex flex-1 items-center justify-between min-w-0 px-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-3">
                {(hasSidebar || sidebarMounted) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    square
                    aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                    title={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                    onClick={toggleSidebar}
                    className="shrink-0 border-none text-header-control-foreground shadow-none hover:text-header-control-hover-foreground cursor-pointer"
                    data-component-id="erp.components.header.btn.sidebarcollapsed"
                  >
                    {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                  </Button>
                )}
                {brand ?? null}
                {nav && nav.length ? <Nav items={nav} onNavigate={onNavigate} dropdown={navDropdown} /> : null}
              </div>
              <div className="flex items-center gap-2">
                {search ?? null}
                {extra ?? null}
                {profile ?? null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full px-4 sm:px-6 lg:px-7">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-8">
              {brand ?? null}
              {nav && nav.length ? (
                <div className="hidden md:block">
                  <Nav items={nav} onNavigate={onNavigate} dropdown={navDropdown} />
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {search ?? null}
              {extra ?? null}
              {profile ?? null}
              <button
                data-component-id="erp.header.mobile-nav-toggle"
                type="button"
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                onClick={toggleMobile}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-header-control-border bg-header-control text-header-control-foreground transition-colors hover:bg-header-control-hover hover:text-header-control-hover-foreground md:hidden"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {!useDrawer && (nav?.length || search) && (
        <div
          className={[
            "overflow-hidden border-t border-header-mobile-border bg-header-mobile backdrop-blur-sm transition-[max-height,opacity,transform] duration-300 ease-out md:hidden",
            mobileOpen ? "max-h-[480px] translate-y-0 opacity-100" : "max-h-0 -translate-y-1 opacity-0 pointer-events-none",
          ].join(" ")}
        >
          {search && <div className="px-4 pt-3 pb-1">{search}</div>}
          {nav && nav.length > 0 && (
            <nav className="flex flex-col gap-1 px-4 py-3">
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
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-header-nav-foreground hover:bg-header-mobile-item-hover hover:text-header-nav-hover-foreground"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
