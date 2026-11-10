"use client";

import State from "@/components/State";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <State kind="page"
      variant="404"
      code={404}
      pill="404 · Página não encontrada"
      title="Essa página não existe"
      description="O endereço que você digitou foi removido, nunca existiu ou pode ter sido movido. Verifique a URL ou volte para a página inicial."
      icon={<FileSearch />}
    />
  );
}
