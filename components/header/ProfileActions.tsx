"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type LucideIcon, ChevronRight, LogOut, Settings, User, Briefcase, Building2 } from "lucide-react";

// ─── ProfileMenuHeader ────────────────────────────────────────────────────────

export type ProfileMenuHeaderProps = {
  /** URL da imagem de avatar */
  avatarUrl?: string | null;
  avatar?: string;
  /** @deprecated Prefira `avatarUrl`. Mantido por compatibilidade. */
  fotoUrl?: string | null;
  usuarioId?: string | number | null;
  /** Callback opcional para resolver dinamicamente a URL do avatar a partir do ID do usuário */
  resolveAvatarUrl?: (userId: string) => string | null | Promise<string | null>;
  initials?: string;
  name?: string;
  login?: string;
  email?: string;
  departamentoNome?: string | null;
  cargoNome?: string | null;
};

export function ProfileMenuHeader({
  avatarUrl,
  avatar,
  fotoUrl,
  usuarioId,
  resolveAvatarUrl,
  initials,
  name,
  login,
  email,
  departamentoNome,
  cargoNome,
}: ProfileMenuHeaderProps) {
  const directSrc = avatarUrl || fotoUrl || avatar || null;
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (directSrc || usuarioId == null || !resolveAvatarUrl) {
      setResolvedSrc(null);
      return;
    }
    const userIdStr = String(usuarioId).trim();
    if (!userIdStr) {
      setResolvedSrc(null);
      return;
    }
    try {
      const result = resolveAvatarUrl(userIdStr);
      if (typeof result === "string" || result === null) {
        setResolvedSrc(result || null);
      } else if (result && typeof result.then === "function") {
        result
          .then((url) => {
            if (!cancelled) setResolvedSrc(url || null);
          })
          .catch(() => {
            if (!cancelled) setResolvedSrc(null);
          });
      }
    } catch {
      if (!cancelled) setResolvedSrc(null);
    }
    return () => {
      cancelled = true;
    };
  }, [directSrc, usuarioId, resolveAvatarUrl]);

  const imgSrc = directSrc || resolvedSrc;

  useEffect(() => {
    setImgFailed(false);
  }, [imgSrc]);

  const showImg = Boolean(imgSrc && !imgFailed);

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-800/40">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white ring-2 ring-slate-200 dark:ring-zinc-600 shadow-sm">
          {showImg && imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={name ?? "avatar"}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="flex items-center justify-center">
              {initials || (name ? name.slice(0, 2).toUpperCase() : <User size={18} />)}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          {name && (
            <p className="truncate text-sm font-bold leading-tight text-zinc-900 dark:text-zinc-100">
              {name}
            </p>
          )}
          {(login || email) && (
            <p className="mt-0.5 truncate text-xs font-medium leading-tight text-zinc-500 dark:text-zinc-400">
              {login ? `@${login}` : email}
            </p>
          )}
        </div>
      </div>

      {(cargoNome || departamentoNome) && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {cargoNome && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
              <Briefcase size={10} />
              {cargoNome}
            </span>
          )}
          {departamentoNome && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
              <Building2 size={10} />
              {departamentoNome}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ProfileMenuDivider ───────────────────────────────────────────────────────

export function ProfileMenuDivider() {
  return (
    <div className="my-1 mx-3 border-t border-zinc-200 dark:border-zinc-700/80" role="separator" />
  );
}

// ─── ProfileMenuItem ──────────────────────────────────────────────────────────

export type ProfileMenuItemProps = {
  /** Ícone lucide-react */
  icon?: LucideIcon;
  /** Texto principal */
  label: string;
  /** Texto secundário abaixo do label */
  description?: string;
  /** Atalho de teclado exibido à direita (ex: \"⌘K\") */
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
  /** Identificador de componente para telemetria / automação */
  componentId?: string;
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
  componentId,
}: ProfileMenuItemProps) {
  const base = [
    "group flex min-h-[var(--header-profile-menu-item-height)] w-full items-center gap-2.5",
    "mx-1 w-[calc(100%-8px)] px-3 py-2 rounded-lg text-sm transition-colors duration-100",
    disabled
      ? "cursor-not-allowed opacity-40"
      : danger
      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 cursor-pointer",
  ].join(" ");

  const inner = (
    <>
      {Icon && (
        <span
          className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-md transition-colors group-hover:bg-zinc-200/70 dark:group-hover:bg-zinc-600/50 ${
            danger
              ? "text-red-500 dark:text-red-400"
              : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
          }`}
        >
          <Icon size={15} strokeWidth={1.75} />
        </span>
      )}
      <span className="flex-1 text-left min-w-0">
        <span className="block leading-snug font-medium">{label}</span>
        {description && (
          <span suppressHydrationWarning className="mt-0.5 block text-xs leading-snug text-header-profile-menu-muted truncate">
            {description}
          </span>
        )}
      </span>
      {badge && <span className="shrink-0">{badge}</span>}
      {shortcut && (
        <kbd className="shrink-0 rounded-md bg-header-profile-menu-hover px-1.5 py-1 text-[10px] font-medium leading-none text-header-profile-menu-muted">
          {shortcut}
        </kbd>
      )}
      {arrow && <ChevronRight size={13} className="shrink-0 text-header-profile-menu-muted opacity-60" />}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={base}
        role="menuitem"
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={base}
      onClick={disabled ? undefined : onClick}
      data-component-id={componentId || `erp.profile-menu.${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {inner}
    </button>
  );
}

// ─── ProfileMenuSectionTitle ──────────────────────────────────────────────────

export function ProfileMenuSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
      {children}
    </div>
  );
}

// ─── ProfileActions ───────────────────────────────────────────────────────────

export type ProfileActionsProps = ProfileMenuHeaderProps & {
  /** Lista customizada de itens do menu */
  items?: ProfileMenuItemProps[];
  /** Conteúdo livre renderizado antes da ação de sair */
  children?: React.ReactNode;
  /** Href do item Perfil (padrão: "/profile" quando `items` não é informado) */
  profileHref?: string | null;
  onProfileClick?: () => void;
  showProfile?: boolean;
  /** Href do item Configurações (padrão: "/settings" quando `items` não é informado) */
  settingsHref?: string | null;
  onSettingsClick?: () => void;
  showSettings?: boolean;
  /** Callback ou rota de saída */
  onLogout?: () => void;
  logoutHref?: string;
  logoutLabel?: string;
  showLogout?: boolean;
  /** Controla exibição do cabeçalho do perfil (padrão: true quando dados do usuário são informados) */
  showHeader?: boolean;
  className?: string;
};

export function ProfileActions({
  avatarUrl,
  avatar,
  fotoUrl,
  usuarioId,
  resolveAvatarUrl,
  initials,
  name,
  login,
  email,
  departamentoNome,
  cargoNome,
  items,
  children,
  profileHref = "/profile",
  onProfileClick,
  showProfile = true,
  settingsHref = "/settings",
  onSettingsClick,
  showSettings = true,
  onLogout,
  logoutHref = "/logout",
  logoutLabel = "Sair",
  showLogout = true,
  showHeader,
  className,
}: ProfileActionsProps = {}) {
  const router = useRouter();

  const hasUserInfo = Boolean(
    name ||
      email ||
      login ||
      initials ||
      avatarUrl ||
      fotoUrl ||
      avatar ||
      (usuarioId != null && resolveAvatarUrl) ||
      departamentoNome ||
      cargoNome
  );
  const shouldRenderHeader = showHeader ?? hasUserInfo;

  const defaultItems: ProfileMenuItemProps[] = [];
  if (!items) {
    if (showProfile && (profileHref || onProfileClick)) {
      defaultItems.push({
        icon: User,
        label: "Perfil",
        description: "Ver e editar perfil",
        href: onProfileClick && !profileHref ? undefined : (profileHref ?? undefined),
        onClick: onProfileClick,
      });
    }
    if (showSettings && (settingsHref || onSettingsClick)) {
      defaultItems.push({
        icon: Settings,
        label: "Configurações",
        shortcut: "⌘,",
        href: onSettingsClick && !settingsHref ? undefined : (settingsHref ?? undefined),
        onClick: onSettingsClick,
      });
    }
  }

  const effectiveItems = items ?? defaultItems;
  const hasBodyContent = effectiveItems.length > 0 || Boolean(children);

  return (
    <div className={className}>
      {shouldRenderHeader && (
        <ProfileMenuHeader
          avatarUrl={avatarUrl}
          avatar={avatar}
          fotoUrl={fotoUrl}
          usuarioId={usuarioId}
          resolveAvatarUrl={resolveAvatarUrl}
          initials={initials}
          name={name}
          login={login}
          email={email}
          departamentoNome={departamentoNome}
          cargoNome={cargoNome}
        />
      )}

      {effectiveItems.length > 0 && (
        <div className="py-1">
          {effectiveItems.map((item, idx) => (
            <ProfileMenuItem key={item.componentId ?? `${item.label}-${idx}`} {...item} />
          ))}
        </div>
      )}

      {children}

      {showLogout && (
        <>
          {hasBodyContent && <ProfileMenuDivider />}
          <div className="py-1">
            <ProfileMenuItem
              icon={LogOut}
              label={logoutLabel}
              danger
              onClick={onLogout ?? (() => router.push(logoutHref))}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileActions;
