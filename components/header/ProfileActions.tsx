"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type LucideIcon, ChevronRight, LogOut, Settings, User, Briefcase, Building2 } from "lucide-react";
import { useAccessControl } from "../useAccessControl";

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
  const userIdStr = usuarioId != null ? String(usuarioId).trim() : "";
  const [asyncResolved, setAsyncResolved] = useState<{ key: string; url: string | null } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (directSrc || !userIdStr || !resolveAvatarUrl) {
      return;
    }
    try {
      const result = resolveAvatarUrl(userIdStr);
      if (result && typeof result === "object" && typeof result.then === "function") {
        result
          .then((url) => {
            if (!cancelled) setAsyncResolved({ key: userIdStr, url: url || null });
          })
          .catch(() => {
            if (!cancelled) setAsyncResolved({ key: userIdStr, url: null });
          });
      }
    } catch {
      // ignore synchronous errors in custom resolver
    }
    return () => {
      cancelled = true;
    };
  }, [directSrc, userIdStr, resolveAvatarUrl]);

  let syncResolved: string | null = null;
  if (!directSrc && userIdStr && resolveAvatarUrl) {
    try {
      const maybeSync = resolveAvatarUrl(userIdStr);
      if (typeof maybeSync === "string") {
        syncResolved = maybeSync || null;
      }
    } catch {
      syncResolved = null;
    }
  }

  const resolvedSrc =
    syncResolved ?? (asyncResolved?.key === userIdStr ? asyncResolved.url : null);
  const imgSrc = directSrc || resolvedSrc;
  const showImg = Boolean(imgSrc && failedSrc !== imgSrc);

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5 border-b border-border bg-muted/40">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white ring-2 ring-border shadow-sm">
          {showImg && imgSrc ? (
            <img
              src={imgSrc}
              alt={name ?? "Avatar do usuário"}
              className="h-full w-full object-cover"
              onError={() => setFailedSrc(imgSrc)}
            />
          ) : (
            <span className="flex items-center justify-center">
              {initials || (name ? name.slice(0, 2).toUpperCase() : <User size={18} />)}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          {name && (
            <p className="truncate text-sm font-bold leading-tight text-foreground">
              {name}
            </p>
          )}
          {(login || email) && (
            <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">
              {login ? `@${login}` : email}
            </p>
          )}
        </div>
      </div>

      {(cargoNome || departamentoNome) && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {cargoNome && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <Briefcase size={10} />
              {cargoNome}
            </span>
          )}
          {departamentoNome && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border">
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
    <div className="my-1 mx-3 border-t border-border" role="separator" />
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
  /** Identificador de componente para telemetria / RBAC */
  componentId?: string;
  /** Oculta o item caso o usuário não tenha permissão em `componentId` */
  hideIfDenied?: boolean;
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
  hideIfDenied = true,
}: ProfileMenuItemProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = disabled || !hasPermission;
  const resolvedComponentId =
    componentId || `erp.profile-menu.${label.toLowerCase().replace(/\s+/g, "-")}`;

  const base = [
    "group flex min-h-[var(--header-profile-menu-item-height)] w-full items-center gap-2.5",
    "mx-1 w-[calc(100%-8px)] px-3 py-2 rounded-lg text-sm transition-colors duration-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    effectiveDisabled
      ? "cursor-not-allowed opacity-40"
      : danger
      ? "text-destructive hover:bg-destructive/10 cursor-pointer"
      : "text-foreground hover:bg-accent cursor-pointer",
  ].join(" ");

  const inner = (
    <>
      {Icon && (
        <span
          className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-md transition-colors group-hover:bg-muted ${
            danger
              ? "text-destructive"
              : "text-muted-foreground group-hover:text-foreground"
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
        aria-disabled={effectiveDisabled || undefined}
        tabIndex={effectiveDisabled ? -1 : undefined}
        data-component-id={resolvedComponentId}
        onClick={effectiveDisabled ? (e) => e.preventDefault() : onClick}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={effectiveDisabled}
      className={base}
      onClick={effectiveDisabled ? undefined : onClick}
      data-component-id={resolvedComponentId}
    >
      {inner}
    </button>
  );
}

// ─── ProfileMenuSectionTitle ──────────────────────────────────────────────────

export function ProfileMenuSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
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
  componentId?: string;
  hideIfDenied?: boolean;
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
  componentId,
  hideIfDenied = true,
}: ProfileActionsProps = {}) {
  const router = useRouter();
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

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
    <div
      className={className}
      data-component-id={componentId || undefined}
    >
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
