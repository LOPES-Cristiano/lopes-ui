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
          <div >
                <Image src="/logo.svg" alt={title} fill className=" object-cover" />
          </div>
        )}
        <span className="hidden font-semibold text-zinc-900 sm:block">{title}</span>
      </Link>
    </div>
  );
}
