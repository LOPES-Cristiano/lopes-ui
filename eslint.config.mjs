import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Portable React component library files intentionally use standard <img>
    // so they work identically in Next.js, Vite, Remix, and standalone bundles.
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Library build output — compiled code should not be linted
    "dist/**",
    // CLI source uses Node.js require()-style dynamic imports intentionally
    "cli/**",
  ]),
]);

export default eslintConfig;
