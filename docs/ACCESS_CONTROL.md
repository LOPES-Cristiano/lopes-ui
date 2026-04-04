# Controle de Acesso - Inventário de Componentes e Fluxo

Última atualização: 2026-04-03

Resumo
- Objetivo: padronizar como componentes de UI e endpoints são inventariados, revisados e autorizados em um ecossistema multi-produto que compartilha o mesmo banco de dados.
- Resultado esperado: um `manifest.json` gerado em CI, um serviço de sincronização para o banco, e uma `Admin UI` para aprovar/atribuir permissões operacionais.

**Glossário**
- componentId: identificador estável do componente UI (ex.: `erp.produto.cadastrar`).
- manifest: arquivo JSON gerado pela análise estática do frontend que lista `componentId`s e metadata.
- Admin UI: aplicação que mostra inventário e diffs e permite atribuir roles/usuários.
- Diff: comparação entre `manifest` (código) e `components` (DB).

Principais conceitos
- O `manifest` é inventário — não guarda permissões. O DB guarda a fonte da verdade sobre quem pode usar cada componente.
- O fluxo recomendado é híbrido: CI cria/atualiza `manifest` (PR opcional) → webhook/job sincroniza diffs com Admin UI → Admin aprova e grava permissões no DB.

1. Convenção de `componentId`
- Formato sugerido: `<produto>.<modulo>.<acao>` ou `<dominio>.<recurso>.<acao>`.
- Exemplo: `erp.produto.cadastrar`, `pdv.venda.finalizar`, `chat.mensagem.enviar`.

2. Marcações no Frontend (exemplos)

- Prop direta (JSX/TSX):

```tsx
// components/Button.tsx
export function Button({ componentId, children, ...props }: { componentId?: string; children: React.ReactNode }) {
  return <button data-component-id={componentId} {...props}>{children}</button>
}

// Uso na aplicação
<Button componentId="erp.produto.cadastrar">Salvar</Button>
```

- HOC helper (recomendado para evitar repetição):

```tsx
import React from 'react';

export function withComponentId<P>(Wrapped: React.ComponentType<P>, id: string) {
  return (props: P) => <Wrapped {...props as P} componentId={id} />;
}

// Uso:
const CadastrarButton = withComponentId(Button, 'erp.produto.cadastrar');
<CadastrarButton>Salvar</CadastrarButton>
```

3. Estrutura do `manifest.json` (exemplo)

```json
{
  "generatedAt": "2026-04-03T12:00:00Z",
  "originCommit": "abcd1234",
  "components": [
    {
      "componentId": "erp.produto.cadastrar",
      "label": "Botão Cadastrar Produto",
      "file": "apps/erp/src/pages/produtos/index.tsx",
      "line": 128
    }
  ]
}
```

4. Extrator (visão geral)
- Ferramenta: Node.js script usando `ts-morph` ou `@babel/parser` para varrer arquivos `.tsx/.jsx` e localizar literais em props `componentId` ou chamadas `withComponentId`.
- Metadata capturada: `componentId`, `label` (opcional), `file`, `line`, `originCommit`.
- Resultado: `manifest.json` idempotente (ordenado) commitável.

5. CI e fluxo de revisão
- GitHub Action (exemplo):
  1. Roda `npm run extract-manifest`.
  2. Se `manifest.json` mudou, cria/atualiza um PR com diff para revisão nomenclatura/metadata.
  3. Após merge, um webhook dispara a sincronização com o DB (ou o job de CI pode postar num endpoint `POST /sync/manifest`).

6. Diff e Admin UI
- A UI deve ter uma tela `Inventory -> Differences` que mostra:
  - `New` (componentes presentes no manifest e ausentes no DB)
  - `Removed` (presentes no DB e sem referência no manifest)
  - `Changed` (metadados alterados: label, file, line)
- Ações por item:
  - `Approve` → cria/atualiza registro em `components` no DB
  - `Ignore` → cria regra para não sincronizar (ex.: experimental)
  - `Rename` → permite editar `componentId` antes de aplicar
  - `Mark Deprecated` / `Delete`
- Bulk actions: `Approve all new`, `Mark all removed as deprecated`.

7. Esquema mínimo de DB (SQL)

```sql
CREATE TABLE components (
  id SERIAL PRIMARY KEY,
  component_id TEXT UNIQUE NOT NULL,
  label TEXT,
  description TEXT,
  file TEXT,
  line INT,
  origin_commit TEXT,
  status TEXT DEFAULT 'active', -- active|deprecated
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE role_component_permissions (
  role_id INT REFERENCES roles(id),
  component_id INT REFERENCES components(id),
  allowed BOOLEAN DEFAULT true,
  PRIMARY KEY (role_id, component_id)
);

CREATE TABLE user_roles (user_id INT, role_id INT, PRIMARY KEY (user_id, role_id));

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  meta JSONB,
  ts TIMESTAMP DEFAULT now()
);
```

8. API - endpoints recomendados
- `POST /api/sync/manifest` — aceita `manifest.json`, retorna diff (new/removed/changed).
- `GET /api/sync/diff` — retorna último diff salvo para análise na UI.
- `POST /api/sync/apply` — aplica aprovações selecionadas ao DB (autorizado só para admins/service).
- `GET /api/components` — lista paginada de componentes para Admin UI.

Exemplo minimal (Next.js API handler):

```ts
// pages/api/sync/manifest.ts
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const manifest = req.body;
  // validar, salvar diff, retornar resumo
  res.json({ ok: true, summary: { new: 3, removed: 1, changed: 2 } });
}
```

9. Runtime - como proteger componentes na UI
- Padrão: `Protected` HOC/Component que verifica autorização antes de renderizar ação sensível.

```tsx
// hooks/usePermissions.ts (exemplo)
export function usePermissions() {
  // chama /api/auth/me ou cache (Redis) para buscar permissões do usuário
  return {
    can: (componentId: string) => {
      // lógica de verificação local/cache
      return true; // placeholder
    }
  }
}

// Uso:
function SaveButton() {
  const perms = usePermissions();
  if (!perms.can('erp.produto.cadastrar')) return null; // ou botão disabled
  return <Button componentId="erp.produto.cadastrar">Salvar</Button>;
}
```

10. Cache e invalidação
- Use Redis para armazenar permissões por `user_id` com TTL (ex.: 5 min).
- Ao aplicar mudanças no Admin UI, publique evento `permissions:changed` (Redis pub/sub ou webhook) para invalidar caches nos serviços.

11. Auditoria e segurança
- Grave `actor_id`, `origin_commit`, `action` (approve/create/rename/delete), e `diff` aplicado.
- Forçar MFA/role admin para aplicar mudanças críticas (renames/deletes).

12. UX de Diff (dicas)
- Mostrar lado-a-lado: `Manifest` à esquerda, `DB` à direita.
- Sinalizar risco: renames sugeridos por heurística (Levenshtein ou path similarity).
- Permitir comentários e criação de issue integrada ao PR (GitHub) para casos complexos.

13. Exemplo de GitHub Action (simplificado)

```yaml
name: Extract manifest
on: [push, pull_request]
jobs:
  extract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run extract-manifest # gera manifest.json
      - name: Commit manifest
        run: |
          git config user.name 'ci'
          git config user.email 'ci@local'
          git add manifest.json || true
          git commit -m 'chore: update manifest' || true
          git push || true
      # opcional: criar PR com changeset
```

14. Migração e rollout
- Comece com apenas `read`/inventário: extrator + PR.
- Habilite Admin UI para aprovar/atribuir permissões manualmente.
- Só depois habilite auto-apply para novos componentes (com tag `auto_enable: true`).

15. Próximos passos sugeridos
- Implementar `scripts/extract-manifest.ts` (CLI) e `scripts/compare-manifest.ts`.
- Criar endpoint `POST /api/sync/manifest` e uma tela `Admin -> Diff`.
- Escrever migrations SQL/ORM para `components` e `role_component_permissions`.

Referências rápidas
- ts-morph: https://ts-morph.com/
- GitHub Actions docs: https://docs.github.com/actions

---
Arquivo gerado automaticamente pelo time – adapte convenções conforme o domínio.
