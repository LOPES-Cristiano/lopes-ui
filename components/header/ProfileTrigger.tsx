'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';

const sizeConfig = {
  sm: { avatar: 'h-8 w-8 text-xs', icon: 14, chevron: 11, gap: 'gap-1.5', text: 'text-xs' },
  md: { avatar: 'h-9 w-9 text-sm', icon: 16, chevron: 13, gap: 'gap-2', text: 'text-sm' },
  lg: { avatar: 'h-11 w-11 text-base', icon: 18, chevron: 15, gap: 'gap-2.5', text: 'text-sm' },
};

export type ProfileTriggerProps = {
  /** Conteúdo do dropdown */
  children: React.ReactNode;
  /** Substitui completamente o trigger padrão */
  trigger?: React.ReactNode;
  /** URL da imagem de avatar */
  avatarUrl?: string | null;
  /** URL da imagem de avatar */
  avatar?: string;
  /** @deprecated Prefira `avatarUrl`. Mantido por compatibilidade. */
  fotoUrl?: string | null;
  /** ID do usuário */
  usuarioId?: string | number | null;
  /** Callback opcional para resolver dinamicamente a URL do avatar a partir do ID do usuário */
  resolveAvatarUrl?: (userId: string) => string | null | Promise<string | null>;
  /** Iniciais exibidas quando não há imagem (ex: "CL") */
  initials?: string;
  /** Nome exibido ao lado do avatar */
  name?: string;
  /** Subtítulo/filial exibido abaixo do nome */
  subtitle?: string;
  /** Exibe a seta de chevron */
  showChevron?: boolean;
  /** Tamanho do avatar e trigger */
  size?: 'sm' | 'md' | 'lg';
  /** Formato do avatar */
  shape?: 'circle' | 'square';
  /** Alinhamento horizontal do dropdown */
  align?: 'left' | 'right';
  /** Classe de largura do painel (ex: "w-56", "w-64") */
  menuWidth?: string;
  ariaLabel?: string;
  componentId?: string;
  /** Classe de estilo personalizada para o chevron */
  chevronClassName?: string;
  /** Classe de estilo personalizada para o avatar/ring */
  avatarClassName?: string;
};

export function ProfileTrigger({
  children,
  trigger,
  avatarUrl,
  avatar,
  fotoUrl,
  usuarioId,
  resolveAvatarUrl,
  initials,
  name,
  subtitle,
  showChevron = true,
  size = 'md',
  shape = 'circle',
  align = 'right',
  menuWidth = 'w-56',
  ariaLabel = 'Perfil',
  componentId,
  chevronClassName = '',
  avatarClassName = '',
}: ProfileTriggerProps) {
  const [open, setOpen] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const cfg = sizeConfig[size];
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  const directSrc = avatarUrl || fotoUrl || avatar || null;

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
      if (typeof result === 'string' || result === null) {
        setResolvedSrc(result || null);
      } else if (result && typeof result.then === 'function') {
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

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const showImg = Boolean(imgSrc && !imgFailed);

  const defaultTrigger = (
    <span className={`inline-flex items-center ${cfg.gap}`}>
      {/* Avatar elegante */}
      <span
        className={`h-10 w-10 ${shapeClass} overflow-hidden flex items-center justify-center bg-blue-600 dark:bg-zinc-800 text-white font-bold text-xs shrink-0 shadow-xs ${
          avatarClassName || 'ring-2 ring-white/40 md:ring-slate-300 md:dark:ring-zinc-600'
        }`}
      >
        {showImg && imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={name ?? 'avatar'}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="flex items-center justify-center">
            {initials || (name ? name.slice(0, 2).toUpperCase() : <User size={cfg.icon} />)}
          </span>
        )}
      </span>

      {/* Nome e Subtítulo (Filial) */}
      {(name || subtitle) && (
        <span className="hidden sm:flex flex-col text-left justify-center leading-none pr-0.5">
          {name && (
            <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
              {name}
            </span>
          )}
          {subtitle && (
            <span
              suppressHydrationWarning
              className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-white mt-0.5 truncate max-w-[150px]"
            >
              {subtitle}
            </span>
          )}
        </span>
      )}

      {/* Chevron */}
      {showChevron && (
        <ChevronDown
          size={15}
          className={`${chevronClassName || 'text-header-profile-trigger-foreground'} transition-transform duration-200 ml-0.5 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      )}
    </span>
  );

  return (
    <div
      className="relative"
      ref={ref}
    >
      <button
        ref={buttonRef}
        data-component-id={componentId ? `${componentId}.trigger` : 'erp.header.profile-trigger'}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center ${cfg.gap} rounded-full bg-header-profile-trigger px-1.5 py-1 text-header-profile-trigger-foreground hover:bg-header-profile-trigger-hover transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-header-ring cursor-pointer`}
      >
        {trigger ?? defaultTrigger}
      </button>

      {/* Dropdown panel — sempre no DOM para permitir transição CSS */}
      <div
        role="menu"
        aria-hidden={!open}
        inert={!open}
        onClick={() => setOpen(false)}
        className={[
          'absolute mt-2 overflow-hidden bg-header-profile-menu text-header-profile-menu-foreground ring-1 ring-header-profile-menu-border z-50',
          'rounded-[var(--header-profile-menu-radius)] shadow-[var(--header-profile-menu-shadow)]',
          'translate-x-[var(--header-profile-menu-offset-x)]',
          menuWidth,
          align === 'right' ? 'right-0' : 'left-0',
          'transition-all duration-150 ease-out origin-top-right',
          open
            ? 'visible opacity-100 scale-100 pointer-events-auto'
            : 'invisible opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

export default ProfileTrigger;
