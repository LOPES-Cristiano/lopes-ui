import Link from "next/link";
import Image from "next/image";

export default function Brand({
  logo,
  title = "Logo",
  componentId,
}: {
  logo?: React.ReactNode;
  title?: string;
  componentId?: string;
}) {
  return (
    <div className="flex items-center gap-4" {...(componentId ? { ['data-component-id']: componentId } : {})}>
      <Link href="/" className="flex items-center gap-3">
        {logo ?? (
          <div className="relative h-7 w-7 shrink-0">
            <Image src="/logo.svg" alt={title} fill className="object-contain" />
          </div>
        )}
        <span className="hidden font-semibold text-zinc-900 dark:text-zinc-100 sm:block">{title}</span>
      </Link>
    </div>
  );
}
