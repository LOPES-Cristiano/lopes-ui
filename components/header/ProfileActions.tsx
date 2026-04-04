"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  type LucideIcon,
  LogOut,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";

// ─── ProfileMenuHeader ────────────────────────────────────────────────────────

export type ProfileMenuHeaderProps = {
  avatar?: string;
  initials?: string;
  name?: string;
  email?: string;
};

export function ProfileMenuHeader({ avatar, initials, name, email }: ProfileMenuHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 border-b border-zinc-100 dark:border-zinc-800">
      {(avatar || initials) && (
        <span className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold shrink-0">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name ?? "avatar"} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </span>
      )}
      <div className="min-w-0">
        {name && <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{name}</p>}
        {email && <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{email}</p>}
      </div>
    </div>
  );
}

// ─── ProfileMenuDivider ───────────────────────────────────────────────────────

export function ProfileMenuDivider() {
  return <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />;
}

// ─── ProfileMenuItem ──────────────────────────────────────────────────────────

export type ProfileMenuItemProps = {
  /** Ícone lucide-react */
  icon?: LucideIcon;
  /** Texto principal */
  label: string;
  /** Texto secundário abaixo do label */
  description?: string;
  /** Atalho de teclado exibido à direita (ex: "⌘K") */
  shortcut?: string;
  /** Navega para este href em vez de chamar onClick */
  href?: string;
  onClick?: () => void;
  /** Estilo destrutivo / sair */
  danger?: boolean;
  disabled?: boolean;
  /** Conteúdo livre à direita (badge, tag…) */
  badge?: React.ReactNode;
  /** Seta indicando sub-navegação */
  arrow?: boolean;
};

export function ProfileMenuItem({
  icon: Icon,
  label,
  description,
  shortcut,
  href,
  onClick,
  danger = false,
  disabled = false,
  badge,
  arrow = false,
}: ProfileMenuItemProps) {
  const base = [
    "group flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-none transition-colors duration-100",
    disabled
      ? "cursor-not-allowed opacity-40"
      : danger
      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer",
  ].join(" ");

  const inner = (
    <>
      {Icon && (
        <span
          className={`shrink-0 transition-colors ${
            danger
              ? "text-red-400 group-hover:text-red-500 dark:text-red-500"
              : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
          }`}
        >
          <Icon size={15} strokeWidth={1.75} />
        </span>
      )}
      <span className="flex-1 text-left min-w-0">
        <span className="block leading-snug">{label}</span>
        {description && (
          <span className="block text-xs text-zinc-400 dark:text-zinc-500 leading-snug mt-0.5">{description}</span>
        )}
      </span>
      {badge && <span className="shrink-0">{badge}</span>}
      {shortcut && (
        <kbd className="shrink-0 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">
          {shortcut}
        </kbd>
      )}
      {arrow && <ChevronRight size={13} className="shrink-0 text-zinc-300 dark:text-zinc-600" />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={base} role="menuitem">
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={base}
      onClick={disabled ? undefined : onClick}
    >
      {inner}
    </button>
  );
}

// ─── ProfileActions (default) ─────────────────────────────────────────────────

export default function ProfileActions() {
  const router = useRouter();

  return (
    <div>
      <ProfileMenuHeader
        initials="CL"
        name="Cristiano Lopes"
        email="cristiano@lopesware.com"
      />
      <div className="py-1">
        <ProfileMenuItem icon={User} label="Perfil" description="Ver e editar perfil" href="/profile" />
        <ProfileMenuItem icon={Settings} label="Configurações" shortcut="⌘," href="/settings" />
      </div>
      <ProfileMenuDivider />
      <div className="py-1">
        <ProfileMenuItem
          icon={LogOut}
          label="Sair"
          danger
          onClick={() => router.push("/logout")}
        />
      </div>
    </div>
  );
}