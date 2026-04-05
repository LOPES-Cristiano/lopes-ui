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
];

export default defineConfig([
  // ── Library bundle ──────────────────────────────────────────────────────
  {
    entry: {
      index: "components/index.ts",
      hooks: "hooks/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    tsconfig: "tsconfig.build.json",
    external: LIB_EXTERNALS,
    // Mark the entire bundle as a client module so Next.js RSC won't try to
    // execute it on the server. Individual "use client" directives are also
    // preserved as-is inside component files.
    esbuildOptions(options) {
      options.banner = { js: '"use client";' };
    },
  },

  // ── CLI bundle ──────────────────────────────────────────────────────────
  {
    entry: { cli: "cli/index.ts" },
    format: ["cjs"],        // node scripts are CommonJS
    dts: false,
    sourcemap: false,
    clean: false,           // lib config already cleaned dist/
    splitting: false,
    tsconfig: "tsconfig.build.json",
    platform: "node",
    target: "node18",
    // Only Node built-ins needed; no React/Next deps
    external: [],
  },
]);

