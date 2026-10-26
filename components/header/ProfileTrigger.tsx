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
  avatar?: string;
  /** URL da foto de perfil */
  fotoUrl?: string | null;
  /** ID do usuário */
  usuarioId?: string | number | null;
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

export default function ProfileTrigger({
  children,
  trigger,
  avatar,
  fotoUrl,
  usuarioId,
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
  const ref = useRef<HTMLDivElement | null>(null);
  const cfg = sizeConfig[size];
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const isUuid = typeof usuarioId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usuarioId);
  const imgSrc =
    fotoUrl || avatar || (isUuid ? `/api/cadastro/usuarios/${usuarioId}/foto` : null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const defaultTrigger = (
    <span className={`inline-flex items-center ${cfg.gap}`}>
      {/* Avatar elegante */}
      <span
        className={`h-10 w-10 ${shapeClass} overflow-hidden flex items-center justify-center bg-blue-600 dark:bg-zinc-800 text-white font-bold text-xs shrink-0 shadow-xs ${
          avatarClassName || 'ring-2 ring-white/40 md:ring-slate-300 md:dark:ring-zinc-600'
        }`}
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={name ?? 'avatar'}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        <span style={{ display: imgSrc ? 'none' : 'flex' }}>
          {initials || (name ? name.slice(0, 2).toUpperCase() : <User size={cfg.icon} />)}
        </span>
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
          className={`${chevronClassName || 'text-white md:text-slate-500 md:dark:text-slate-400'} transition-transform duration-200 ml-0.5 ${open ? 'rotate-180' : 'rotate-0'}`}
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
        onClick={() => setOpen(false)}
        className={[
          'absolute mt-2 overflow-hidden bg-header-profile-menu text-header-profile-menu-foreground ring-1 ring-header-profile-menu-border z-50',
          'rounded-[var(--header-profile-menu-radius)] shadow-[var(--header-profile-menu-shadow)]',
          'translate-x-[var(--header-profile-menu-offset-x)]',
          menuWidth,
          align === 'right' ? 'right-0' : 'left-0',
          'transition-all duration-150 ease-out origin-top-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
