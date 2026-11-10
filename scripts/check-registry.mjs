// Garante que todo componente de components/ e components/form/ está em app/components/registry.ts
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = readFileSync(join(root, "app/components/registry.ts"), "utf8");

// Infraestrutura (providers, hooks, wrappers) que não precisa de página de demonstração
const IGNORE = new Set(["ShellContext", "ThemeContext", "Controllable", "HeaderWrapper", "useAccessControl", "DataTable", "Sidebar"]);

const files = [...readdirSync(join(root, "components")), ...readdirSync(join(root, "components/form")).map((f) => f)]
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));

const missing = [...new Set(files)].filter((n) => !IGNORE.has(n) && !registry.includes(`e("${n}"`));

if (missing.length) {
  console.error(`Componentes fora do registry.ts: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("registry.ts cobre todos os componentes.");
