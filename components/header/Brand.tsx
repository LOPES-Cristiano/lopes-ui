"use client";

import React from "react";
import Link from "next/link";
import { useAccessControl } from "../useAccessControl";

export interface BrandProps {
  logo?: React.ReactNode;
  title?: string;
  href?: string;
  logoSrc?: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

export default function Brand({
  logo,
  title = "Logo",
  href = "/",
  logoSrc = "/logo.svg",
  componentId,
  hideIfDenied = true,
}: BrandProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-4"
      data-component-id={componentId || undefined}
    >
      <Link
        href={href}
        aria-disabled={!hasPermission || undefined}
        onClick={!hasPermission ? (e) => e.preventDefault() : undefined}
        className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {logo ?? (
          <div className="relative h-7 w-7 shrink-0">
            <img src={logoSrc} alt={title} className="h-full w-full object-contain" />
          </div>
        )}
        <span className="hidden font-semibold text-header-foreground sm:block">{title}</span>
      </Link>
    </div>
  );
}
