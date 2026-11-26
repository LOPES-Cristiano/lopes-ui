import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/ui-builder",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

import { COMPONENT_REGISTRY } from "@/app/components/registry";
import {
  COMPONENT_CATALOG,
  createCatalogElement,
  STUDIO_PRESETS,
} from "@/app/_components/ui-builder/catalog-and-defaults";
import ElementRenderer from "@/app/_components/ui-builder/ElementRenderer";
import { generateTsxCode } from "@/app/_components/ui-builder/tsx-generator";

describe("UI Builder — Complete Lopes UI Component Coverage", () => {
  it("includes 100% of COMPONENT_REGISTRY in COMPONENT_CATALOG", () => {
    const catalogComponents = new Set(COMPONENT_CATALOG.map((c) => c.lopesComponent));
    const missing = COMPONENT_REGISTRY.filter((entry) => !catalogComponents.has(entry.name)).map(
      (entry) => entry.name,
    );
    expect(missing).toEqual([]);
  });

  it("has unique component types across COMPONENT_CATALOG", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const entry of COMPONENT_CATALOG) {
      if (seen.has(entry.type)) duplicates.push(entry.type);
      seen.add(entry.type);
    }
    expect(duplicates).toEqual([]);
  });

  it("renders every single catalog component on the 2D canvas (edit & interactive preview) without crashing", () => {
    const failures: { type: string; mode: string; error: string }[] = [];

    for (const entry of COMPONENT_CATALOG) {
      for (const interactive of [false, true]) {
        try {
          const el = createCatalogElement(entry.type, 24, 24);
          const { container } = render(
            <ElementRenderer element={el} interactive={interactive} />,
          );
          expect(container.firstChild).not.toBeNull();
          cleanup();
        } catch (err) {
          failures.push({
            type: entry.type,
            mode: interactive ? "interactive" : "canvas",
            error: err instanceof Error ? err.message : String(err),
          });
          cleanup();
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("generates non-fallback TSX code for every single catalog component", () => {
    const baseConfig = STUDIO_PRESETS[0].config;
    const fallbacks: string[] = [];

    for (const entry of COMPONENT_CATALOG) {
      const el = createCatalogElement(entry.type, 24, 24);
      const code = generateTsxCode({ ...baseConfig, elements: [el] }, "responsive");
      if (code.includes("<div />")) {
        fallbacks.push(entry.type);
      }
      expect(code).toContain("export default function");
    }

    expect(fallbacks).toEqual([]);
  });
});
