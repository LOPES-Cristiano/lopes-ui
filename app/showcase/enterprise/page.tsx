"use client";

import { useEnterpriseSections } from "@/app/components/demos/enterprise";
import { HR } from "@/app/showcase/_shared";

export default function EnterprisePatternsShowcasePage() {
  const sections = useEnterpriseSections();
  return (
    <main className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 1. Contexto Multi-Unidade & Escopo */}
        {sections["tenant-scope"]}

        <HR />

        {/* 2. CNPJ Alfanumérico 2026 & SmartObject */}
        {sections["cnpj-smart-object"]}

        <HR />

        {/* 3. RichTextViewer & ActiveTimerWidget */}
        {sections["viewer-timer"]}

        <HR />

        {/* 4. Resiliência, RBAC & Privacidade */}
        {sections["resilience-rbac-privacy"]}
      </div>
    </main>
  );
}
