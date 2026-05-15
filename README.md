# my-game-shelf

Monorepo inicial do produto Game Shelf, criado a partir da arquitetura e do roadmap aprovados.

## Estrutura

```text
apps/
  web
  api
  worker

packages/
  contracts
  database
  domain
  ui
  config

docs/
  architecture.md
  roadmap.md
```

## Decisoes iniciais

- monorepo com `npm workspaces`
- backend planejado como modular monolith
- `apps/web` para Next.js
- `apps/api` para API HTTP
- `apps/worker` para jobs assincronos
- `packages/*` para contratos, dominio e configuracao compartilhados

## Proximo passo sugerido

Executar a Fase 0 do roadmap:

1. instalar dependencias do workspace;
2. escolher `NestJS` ou `Fastify` para `apps/api`;
3. adicionar `Prisma`, `PostgreSQL` e `Redis`;
4. configurar autenticacao inicial;
5. ligar CI e validacoes basicas.
