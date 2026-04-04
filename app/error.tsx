"use client";

import Link from "next/link";
import StatusPage from "@/components/StatusPage";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <StatusPage
      variant="500"
      code={500}
      pill="500 · Erro Interno"
      title="Algo deu errado"
      description={
        error?.message
          ? `Detalhes: ${error.message}`
          : "Ocorreu um erro inesperado no servidor. Nossa equipe foi notificada. Tente novamente em instantes."
      }
      icon={<AlertTriangle />}
      actions={
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
          >
            ↻ Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
          >
            ← Início
          </Link>
        </div>
      }
    />
  );
}
