#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ── Constants ────────────────────────────────────────────────────────────────

const cwd = process.cwd();

/**
 * Core peer deps required by the main `lopes-ui` entry (excluding react/react-dom/next).
 */
const CORE_PEERS: Record<string, string> = {
  "lucide-react": "^1.29.0",
  "motion": "^12.40.0",
  "zod": "^4.4.3",
};

const SPREADSHEET_PEERS: Record<string, string> = {
  "@tanstack/react-table": "^8.21.3",
  "@tanstack/react-virtual": "^3.14.15",
};

const CODE_PEERS: Record<string, string> = {
  "shiki": "^4.4.2",
};

const TIPTAP_PEERS: Record<string, string> = {
  "@tiptap/starter-kit": "^3.31.3",
  "@tiptap/react": "^3.31.3",
  "@tiptap/pm": "^3.31.3",
  "@tiptap/extension-character-count": "^3.31.3",
  "@tiptap/extension-color": "^3.31.3",
  "@tiptap/extension-font-family": "^3.31.3",
  "@tiptap/extension-highlight": "^3.31.3",
  "@tiptap/extension-image": "^3.31.3",
  "@tiptap/extension-link": "^3.31.3",
  "@tiptap/extension-placeholder": "^3.31.3",
  "@tiptap/extension-subscript": "^3.31.3",
  "@tiptap/extension-superscript": "^3.31.3",
  "@tiptap/extension-table": "^3.31.3",
  "@tiptap/extension-table-cell": "^3.31.3",
  "@tiptap/extension-table-header": "^3.31.3",
  "@tiptap/extension-table-row": "^3.31.3",
  "@tiptap/extension-task-item": "^3.31.3",
  "@tiptap/extension-task-list": "^3.31.3",
  "@tiptap/extension-text-align": "^3.31.3",
  "@tiptap/extension-text-style": "^3.31.3",
  "@tiptap/extension-typography": "^3.31.3",
  "@tiptap/extension-underline": "^3.31.3",
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
  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) return "bun";
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

function installPeerGroup(
  label: string,
  group: Record<string, string>,
  installed: Record<string, string>,
  pm: ReturnType<typeof detectPM>,
) {
  const missing = Object.entries(group)
    .filter(([name]) => !installed[name])
    .map(([name, ver]) => `${name}@${ver}`);

  if (missing.length > 0) {
    log(`Installing ${label}: ${missing.length > 6 ? `${missing.length} packages` : missing.join(", ")}`);
    execSync(installCmd(pm, missing), { cwd, stdio: "inherit" });
    success(`${label} installed.`);
  } else {
    info(`${label} already present.`);
  }
}

// ── Commands ─────────────────────────────────────────────────────────────────

function runInit(options: { tiptap: boolean; spreadsheet: boolean; code: boolean }) {
  console.log("\n  lopes-ui — init\n");

  const consumerPkg = readConsumerPkg();
  const installed = {
    ...((consumerPkg.dependencies as Record<string, string>) ?? {}),
    ...((consumerPkg.devDependencies as Record<string, string>) ?? {}),
  };
  const pm = detectPM();

  // ── Step 1: core peer deps ──────────────────────────────────────────────
  installPeerGroup("Core peer dependencies", CORE_PEERS, installed, pm);

  // ── Step 2: optional peer groups ────────────────────────────────────────
  if (options.spreadsheet) {
    installPeerGroup("Spreadsheet dependencies (TanStack)", SPREADSHEET_PEERS, installed, pm);
  }
  if (options.code) {
    installPeerGroup("CodeBlock dependencies (Shiki)", CODE_PEERS, installed, pm);
  }
  if (options.tiptap) {
    installPeerGroup("RichTextEditor dependencies (Tiptap)", TIPTAP_PEERS, installed, pm);
  }

  // ── Step 3: patch globals.css ──────────────────────────────────────────
  const cssFile = findGlobalsCss();
  const stylesImport = '@import "lopes-ui/styles.css";';

  if (!cssFile) {
    log("globals.css not found. Add these lines to your CSS file manually right after `@import \"tailwindcss\";`:");
    log(`  ${stylesImport}`);
    log('  @source "./node_modules/lopes-ui/dist";');
  } else {
    let content = fs.readFileSync(cssFile, "utf8");
    const sourceDirective = buildSourceDirective(cssFile);
    const hasStylesImport = content.includes("lopes-ui/styles.css");
    const hasSource = content.includes("@source") && content.includes("lopes-ui");

    if (hasStylesImport && hasSource) {
      info(`globals.css already configured (${path.relative(cwd, cssFile)}).`);
    } else {
      const additions: string[] = [];
      if (!hasStylesImport) additions.push(stylesImport);
      if (!hasSource) additions.push(sourceDirective);

      const importMatch = content.match(/^@import\s+["']tailwindcss["'];?/m);
      content = importMatch
        ? content.replace(importMatch[0], `${importMatch[0]}\n${additions.join("\n")}`)
        : `${additions.join("\n")}\n${content}`;

      fs.writeFileSync(cssFile, content, "utf8");
      success(`Patched ${path.relative(cwd, cssFile)}`);
      for (const line of additions) log(`  Added: ${line}`);
    }
  }

  console.log("\n  Done! You can now import from lopes-ui:\n");
  console.log('  import { Button, DataTable, toast, ThemeProvider, ThemeScript } from "lopes-ui";');
  console.log('  import { Dialog, Tooltip, Popover } from "lopes-ui/primitives";');
  console.log('  import { useAsyncButton } from "lopes-ui/hooks";');
  console.log('  import { formatCurrency } from "lopes-ui/utils";\n');
}

function printHelp() {
  console.log(`
  lopes-ui CLI

  Usage:
    npx lopes-ui init                Set up lopes-ui core + CSS tokens in this project
    npx lopes-ui init --tiptap       Also install RichTextEditor (lopes-ui/rich-text) dependencies
    npx lopes-ui init --spreadsheet  Also install Spreadsheet (lopes-ui/spreadsheet) dependencies
    npx lopes-ui init --code         Also install CodeBlock (lopes-ui/code-block) dependencies
    npx lopes-ui init --all          Install all optional peer dependencies

  Options:
    --tiptap       Install Tiptap peer dependencies (for lopes-ui/rich-text)
    --spreadsheet  Install TanStack peer dependencies (for lopes-ui/spreadsheet)
    --code         Install Shiki peer dependency (for lopes-ui/code-block)
    --all          Install all optional peer dependencies
    --help         Show this help message
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
  const all = flags.has("--all");
  runInit({
    tiptap: all || flags.has("--tiptap"),
    spreadsheet: all || flags.has("--spreadsheet"),
    code: all || flags.has("--code"),
  });
} else {
  console.error(`  Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
