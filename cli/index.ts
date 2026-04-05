#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ── Constants ────────────────────────────────────────────────────────────────

const cwd = process.cwd();

/**
 * Peer deps that are NOT react/react-dom/next (those are always present in a
 * Next.js project). We only install the ones the consumer is likely missing.
 */
const EXTRA_PEERS: Record<string, string> = {
  "lucide-react": "^1.7.0",
  "motion": "^12.38.0",
  "shiki": "^4.0.2",
};

const TIPTAP_PEERS: Record<string, string> = {
  "@tiptap/starter-kit": "^3.22.2",
  "@tiptap/react": "^3.22.2",
  "@tiptap/pm": "^3.22.2",
  "@tiptap/extension-character-count": "^3.22.2",
  "@tiptap/extension-color": "^3.22.2",
  "@tiptap/extension-image": "^3.22.2",
  "@tiptap/extension-link": "^3.22.2",
  "@tiptap/extension-placeholder": "^3.22.2",
  "@tiptap/extension-table": "^3.22.2",
  "@tiptap/extension-table-cell": "^3.22.2",
  "@tiptap/extension-table-header": "^3.22.2",
  "@tiptap/extension-table-row": "^3.22.2",
  "@tiptap/extension-text-align": "^3.22.2",
  "@tiptap/extension-text-style": "^3.22.2",
  "@tiptap/extension-underline": "^3.22.2",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}

function success(msg: string) {
  process.stdout.write(`  ✓ ${msg}\n`);
}

function info(msg: string) {
  process.stdout.write(`  · ${msg}\n`);
}

function detectPM(): "pnpm" | "yarn" | "bun" | "npm" {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

function installCmd(pm: ReturnType<typeof detectPM>, packages: string[]): string {
  const pkgs = packages.join(" ");
  if (pm === "yarn") return `yarn add ${pkgs}`;
  if (pm === "pnpm") return `pnpm add ${pkgs}`;
  if (pm === "bun") return `bun add ${pkgs}`;
  return `npm install ${pkgs}`;
}

function findGlobalsCss(): string | null {
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
    "styles/globals.css",
    "src/styles/globals.css",
    "globals.css",
  ];
  for (const rel of candidates) {
    const full = path.join(cwd, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

/** Builds the @source path relative to the CSS file's directory. */
function buildSourceDirective(cssFile: string): string {
  const cssDir = path.dirname(cssFile);
  const distAbs = path.join(cwd, "node_modules", "lopes-ui", "dist");
  const rel = path.relative(cssDir, distAbs).replace(/\\/g, "/");
  return `@source "${rel}";`;
}

function readConsumerPkg(): Record<string, Record<string, string>> {
  try {
    return JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
  } catch {
    return {};
  }
}

// ── Commands ─────────────────────────────────────────────────────────────────

function runInit(options: { tiptap: boolean }) {
  console.log("\n  lopes-ui — init\n");

  const consumerPkg = readConsumerPkg();
  const installed = {
    ...((consumerPkg.dependencies as Record<string, string>) ?? {}),
    ...((consumerPkg.devDependencies as Record<string, string>) ?? {}),
  };
  const pm = detectPM();

  // ── Step 1: core peer deps ──────────────────────────────────────────────
  const coreMissing = Object.entries(EXTRA_PEERS)
    .filter(([name]) => !installed[name])
    .map(([name, ver]) => `${name}@${ver}`);

  if (coreMissing.length > 0) {
    log(`Installing: ${coreMissing.join(", ")}`);
    execSync(installCmd(pm, coreMissing), { cwd, stdio: "inherit" });
    success("Core peer dependencies installed.");
  } else {
    info("Core peer dependencies already present.");
  }

  // ── Step 2: tiptap peer deps (optional) ────────────────────────────────
  if (options.tiptap) {
    const tiptapMissing = Object.entries(TIPTAP_PEERS)
      .filter(([name]) => !installed[name])
      .map(([name, ver]) => `${name}@${ver}`);

    if (tiptapMissing.length > 0) {
      log(`Installing Tiptap extensions: ${tiptapMissing.length} packages`);
      execSync(installCmd(pm, tiptapMissing), { cwd, stdio: "inherit" });
      success("Tiptap peer dependencies installed.");
    } else {
      info("Tiptap peer dependencies already present.");
    }
  }

  // ── Step 3: patch globals.css ──────────────────────────────────────────
  const cssFile = findGlobalsCss();

  if (!cssFile) {
    log("globals.css not found. Add this line to your CSS file manually:");
    log('  @source "./node_modules/lopes-ui/dist";');
  } else {
    const content = fs.readFileSync(cssFile, "utf8");

    if (content.includes("lopes-ui")) {
      info(`globals.css already configured (${path.relative(cwd, cssFile)}).`);
    } else {
      const directive = buildSourceDirective(cssFile);
      // Insert right after `@import "tailwindcss"` when present
      const importMatch = content.match(/^@import\s+["']tailwindcss["'];?/m);
      const updated = importMatch
        ? content.replace(importMatch[0], `${importMatch[0]}\n${directive}`)
        : `${directive}\n${content}`;

      fs.writeFileSync(cssFile, updated, "utf8");
      success(`Patched ${path.relative(cwd, cssFile)}`);
      log(`  Added: ${directive}`);
    }
  }

  console.log("\n  Done! You can now import from lopes-ui:\n");
  console.log('  import { Button, DataTable, toast } from "lopes-ui";');
  console.log('  import { useAsyncButton } from "lopes-ui/hooks";\n');
}

function printHelp() {
  console.log(`
  lopes-ui CLI

  Usage:
    npx lopes-ui init          Set up lopes-ui in this project
    npx lopes-ui init --tiptap Also install RichTextEditor (Tiptap) dependencies

  Options:
    --tiptap    Install Tiptap peer dependencies (needed for RichTextEditor)
    --help      Show this help message
`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];
const flags = new Set(args.slice(1));

if (!command || command === "--help" || command === "-h" || flags.has("--help") || flags.has("-h")) {
  printHelp();
  process.exit(0);
}

if (command === "init") {
  runInit({ tiptap: flags.has("--tiptap") });
} else {
  console.error(`  Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
