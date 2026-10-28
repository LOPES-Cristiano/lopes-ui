import fs from "node:fs/promises";
import { defineConfig } from "tsup";

const LIB_EXTERNALS = [
  "react",
  "react-dom",
  "next",
  /^next\//,
  "lucide-react",
  "motion",
  /^motion\//,
  "shiki",
  /^@tiptap\//,
  /^@radix-ui\//,
  /^@tanstack\//,
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "react-hot-toast",
  "zod",
];

export default defineConfig([
  // ── Library bundle ──────────────────────────────────────────────────────
  {
    entry: {
      index: "components/index.ts",
      primitives: "components/primitives/index.ts",
      "rich-text": "components/rich-text/index.ts",
      spreadsheet: "components/spreadsheet/index.ts",
      "code-block": "components/CodeBlock.tsx",
      hooks: "hooks/index.ts",
      utils: "utils/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    treeshake: true,
    tsconfig: "tsconfig.build.json",
    external: LIB_EXTERNALS,
    // Mark client bundles so Next.js RSC won't execute interactive hooks on the server.
    esbuildOptions(options) {
      options.banner = { js: '"use client";' };
    },
    async onSuccess() {
      await fs.mkdir("dist", { recursive: true });
      await fs.copyFile("styles/lopes-ui.css", "dist/styles.css");
    },
  },

  // ── CLI bundle ──────────────────────────────────────────────────────────
  {
    entry: { cli: "cli/index.ts" },
    format: ["cjs"],
    dts: false,
    sourcemap: false,
    clean: false,
    splitting: false,
    tsconfig: "tsconfig.build.json",
    platform: "node",
    target: "node18",
    external: [],
  },
]);
