import { redirect } from "next/navigation";
import { SORTED_REGISTRY, slugify } from "../registry";

export function generateStaticParams() {
  return SORTED_REGISTRY.map((c) => ({ slug: slugify(c.name) }));
}

/** A página corrida (/components) substituiu a página individual: mantém links antigos funcionando. */
export default async function ComponentRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/components#${slug}`);
}
