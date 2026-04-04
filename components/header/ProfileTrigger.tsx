"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";

const sizeConfig = {
  sm: { avatar: "h-7 w-7 text-xs",   icon: 14, chevron: 11, gap: "gap-1.5", text: "text-xs" },
  md: { avatar: "h-9 w-9 text-sm",   icon: 16, chevron: 13, gap: "gap-2",   text: "text-sm" },
  lg: { avatar: "h-11 w-11 text-base", icon: 18, chevron: 15, gap: "gap-2.5", text: "text-sm" },
};

export type ProfileTriggerProps = {
  /** Conteúdo do dropdown */
  children: React.ReactNode;
  /** Substitui completamente o trigger padrão */
  trigger?: React.ReactNode;
  /** URL da imagem de avatar */
  avatar?: string;
  /** Iniciais exibidas quando não há imagem (ex: "CL") */
  initials?: string;
  /** Nome exibido ao lado do avatar */
  name?: string;
  /** Exibe a seta de chevron */
  showChevron?: boolean;
  /** Tamanho do avatar e trigger */
  size?: "sm" | "md" | "lg";
  /** Formato do avatar */
  shape?: "circle" | "square";
  /** Alinhamento horizontal do dropdown */
  align?: "left" | "right";
  /** Classe de largura do painel (ex: "w-56", "w-64") */
  menuWidth?: string;
  ariaLabel?: string;
  componentId?: string;
};

export default function ProfileTrigger({
  children,
  trigger,
  avatar,
  initials,
  name,
  showChevron = true,
  size = "md",
  shape = "circle",
  align = "right",
  menuWidth = "w-56",
  ariaLabel = "Perfil",
  componentId,
}: ProfileTriggerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const cfg = sizeConfig[size];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-md";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const defaultTrigger = (
    <span className={`inline-flex items-center ${cfg.gap}`}>
      {/* Avatar */}
      <span className={`${cfg.avatar} ${shapeClass} overflow-hidden flex items-center justify-center bg-zinc-200 text-zinc-600 font-semibold shrink-0 ring-2 ring-white`}>
        {avatar ? (
          <img src={avatar} alt={name ?? "avatar"} className="h-full w-full object-cover" />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User size={cfg.icon} />
        )}
      </span>
      {/* Nome */}
      {name && (
        <span className={`${cfg.text} font-medium text-zinc-700 hidden sm:block`}>{name}</span>
      )}
      {/* Chevron */}
      {showChevron && (
        <ChevronDown
          size={cfg.chevron}
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      )}
    </span>
  );

  return (
    <div
      className="relative"
      ref={ref}
      {...(componentId ? { ["data-component-id"]: componentId } as any : {})}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center ${cfg.gap} rounded-full px-1.5 py-1 hover:bg-zinc-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300`}
      >
        {trigger ?? defaultTrigger}
      </button>

      {/* Dropdown panel — sempre no DOM para permitir transição CSS */}
      <div
        role="menu"
        className={[
          "absolute mt-2 rounded-xl bg-white shadow-xl ring-1 ring-black/[0.06] overflow-hidden z-50",
          menuWidth,
          align === "right" ? "right-0" : "left-0",
          "transition-all duration-150 ease-out origin-top-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
