"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, PanelLeft, PanelLeftClose, X } from "lucide-react";
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
  const router = useRouter();
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
    "z-40 w-full border-b transition-[background-color,box-shadow,border-color] duration-150",
    sticky ? "sticky top-0" : "relative",
    scrolled
      ? "bg-header/95 text-header-foreground backdrop-blur-md max-md:backdrop-blur-none border-header-border shadow-[var(--shadow-control)]"
      : "bg-header text-header-foreground backdrop-blur-sm max-md:backdrop-blur-none border-header-border shadow-[var(--header-shadow)]",
  ].join(" ");

  return (
    <header
      className={headerClass}
      {...(componentId ? { ["data-component-id"]: componentId } : {})}
    >
      {hasSidebar ? (
        <>
          <div className="flex h-16 w-full items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 md:hidden">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {!hideMobileMenu && (sidebarMounted || (nav && nav.length > 0)) && (
                <button
                  data-component-id="erp.header.mobile-toggle"
                  type="button"
                  aria-label="Abrir menu"
                  onClick={toggleMobile}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-header-control-border bg-header-control text-header-control-foreground hover:bg-header-control-hover hover:text-header-control-hover-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-ring transition-colors cursor-pointer"
                >
                  {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}
              {brand ? <div className="min-w-0 truncate">{brand}</div> : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {search ?? null}
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-header-control-border bg-header-control text-header-control-foreground transition-colors hover:bg-header-control-hover hover:text-header-control-hover-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-ring md:hidden"
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
            "overflow-hidden border-t border-header-mobile-border bg-header-mobile backdrop-blur-sm transition-[max-height,opacity,transform] duration-300 ease-out motion-reduce:transition-none md:hidden",
            mobileOpen ? "max-h-[75vh] overflow-y-auto translate-y-0 opacity-100" : "max-h-0 -translate-y-1 opacity-0 pointer-events-none",
          ].join(" ")}
        >
          {search && <div className="px-4 pt-3 pb-1">{search}</div>}
          {nav && nav.length > 0 && (
            <nav className="flex flex-col gap-1 px-4 py-3">
              {nav.map((n, idx) =>
                n.children && n.children.length > 0 ? (
                  <details
                    key={`${n.href ?? "#"}-${n.label}-${idx}`}
                    className="group rounded-md"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-header-nav-foreground hover:bg-header-mobile-item-hover hover:text-header-nav-hover-foreground [&::-webkit-details-marker]:hidden">
                      <span>{n.label}</span>
                      <ChevronDown
                        size={15}
                        className="shrink-0 transition-transform duration-150 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="mt-0.5 flex flex-col gap-0.5 pl-4">
                      {n.href && (
                        <a
                          href={n.href}
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                              setMobileOpen(false);
                              return;
                            }
                            e.preventDefault();
                            if (onNavigate) onNavigate(n.href!);
                            else router.push(n.href!);
                            setMobileOpen(false);
                          }}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-header-nav-foreground/90 hover:bg-header-mobile-item-hover hover:text-header-nav-hover-foreground"
                        >
                          {n.label}
                        </a>
                      )}
                      {n.children.map((child, cIdx) => (
                        <a
                          key={`${child.href ?? "#"}-${child.label}-${cIdx}`}
                          href={child.href ?? "#"}
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                              setMobileOpen(false);
                              return;
                            }
                            if (child.href) {
                              e.preventDefault();
                              if (onNavigate) onNavigate(child.href);
                              else router.push(child.href);
                            }
                            setMobileOpen(false);
                          }}
                          className="block rounded-md px-3 py-2 text-sm text-header-nav-foreground/85 hover:bg-header-mobile-item-hover hover:text-header-nav-hover-foreground"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </details>
                ) : (
                  <a
                    key={`${n.href ?? "#"}-${n.label}-${idx}`}
                    href={n.href ?? "#"}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                        setMobileOpen(false);
                        return;
                      }
                      if (n.href) {
                        e.preventDefault();
                        if (onNavigate) onNavigate(n.href);
                        else router.push(n.href);
                      }
                      setMobileOpen(false);
                    }}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-header-nav-foreground hover:bg-header-mobile-item-hover hover:text-header-nav-hover-foreground"
                  >
                    {n.label}
                  </a>
                )
              )}
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
