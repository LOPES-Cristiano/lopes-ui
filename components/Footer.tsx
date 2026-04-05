import { twMerge } from "tailwind-merge";

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterProps = {
  brand?: string;
  tagline?: string;
  columns?: FooterColumn[];
  copyright?: string;
  /** @default "default" */
  variant?: "default" | "minimal" | "bordered";
  className?: string;
};

const defaultColumns: FooterColumn[] = [
  {
    title: "Produto",
    links: [
      { label: "Componentes", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Documentação", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Suporte", href: "#" },
    ],
  },
];

export default function Footer({
  brand = "Lopes UI",
  tagline,
  columns = defaultColumns,
  copyright,
  variant = "default",
  className,
}: FooterProps) {
  const year = new Date().getFullYear();
  const copyrightText = copyright ?? `© ${year} ${brand}. Todos os direitos reservados.`;

  if (variant === "minimal") {
    return (
      <footer
        className={twMerge(
          "border-t border-zinc-200 dark:border-zinc-800 py-4 px-6",
          "flex flex-wrap items-center justify-between gap-3",
          "bg-white dark:bg-zinc-900",
          className,
        )}
      >
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{brand}</span>
        <span className="text-xs text-zinc-400">{copyrightText}</span>
      </footer>
    );
  }

  return (
    <footer
      className={twMerge(
        "bg-white dark:bg-zinc-900",
        variant === "default" && "border-t border-zinc-200 dark:border-zinc-800",
        variant === "bordered" && "border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden",
        className,
      )}
    >
      <div className="px-8 pt-10 pb-8 flex flex-wrap gap-10">
        {/* Brand / tagline */}
        <div className="flex-1 min-w-[180px]">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{brand}</span>
          {tagline && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              {tagline}
            </p>
          )}
        </div>

        {/* Link columns */}
        <div className="flex flex-wrap gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-zinc-400">{copyrightText}</span>
      </div>
    </footer>
  );
}
