"use client";

import StatusPage from "@/components/StatusPage";
import { Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <StatusPage
      variant="403"
      code={403}
      pill="403 · Acesso Negado"
      title="Você não tem permissão"
      description="Sua conta não possui acesso a este recurso. Se você acredita que isso é um equívoco, entre em contato com o administrador do sistema."
      icon={<Lock />}
      actions={
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 active:scale-95"
          >
            ← Início
          </a>
          <a
            href="mailto:admin@empresa.com"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
          >
            Contatar suporte
          </a>
        </div>
      }
    />
  );
}
