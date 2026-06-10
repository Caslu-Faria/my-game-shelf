# Repository Guidelines

## Project Structure & Module Organization

This repository is an npm workspaces monorepo for My Game Shelf. Application code lives in `apps/`: `apps/web` is the Next.js frontend, `apps/api` is the HTTP API scaffold, and `apps/worker` is for async jobs. Shared code lives in `packages/`: `contracts`, `domain`, `ui`, `config`, and `database`.

Keep backend work aligned with the modular monolith plan in `apps/api/src/modules/README.md`. Planned modules include `auth`, `users`, `catalog`, `library`, `progress`, `notes`, `tasks`, and `integrations/steam`. Keep controllers thin and place business rules in domain or use-case code. Architecture notes and sequencing live in `docs/architecture.md` and `docs/roadmap.md`.

## Build, Test, and Development Commands

- `npm install`: install dependencies for all workspaces. Requires Node.js `>=20`.
- `npm run dev:web`: run the Next.js app locally.
- `npm run dev:api`: run the API scaffold with `node --watch`.
- `npm run dev:worker`: run the worker scaffold with `node --watch`.
- `npm run build`: build all workspaces.
- `npm run typecheck`: run TypeScript checks across workspaces.
- `npm run lint`: run workspace lint scripts. Some packages currently have placeholder lint commands.
- `docker compose -f infra/docker/docker-compose.yml up -d`: start local PostgreSQL and Redis.

## Coding Style & Naming Conventions

Use TypeScript with strict checking from `tsconfig.base.json`. Follow the existing style: 2-space indentation, double quotes, semicolons, and named exports for shared utilities/components. Use `PascalCase` for React components, `camelCase` for variables and functions, and package imports through workspace names such as `@my-game-shelf/domain/*` when applicable. Prefer feature-oriented frontend organization as the app grows.

## Testing Guidelines

No test runner is configured yet. When adding tests, add a `test` script to the relevant workspace and document any new framework choice in the PR. Prefer co-located `*.test.ts` or `*.test.tsx` files near the code under test. Cover domain rules, API module behavior, and critical UI flows before broad snapshot testing. Always keep `npm run typecheck` passing.

## Commit & Pull Request Guidelines

The current Git history is minimal and does not establish a strict convention. Use concise, imperative commit subjects, for example `Add catalog module scaffold` or `Wire web layout metadata`.

Pull requests should include a short description, the affected app/package paths, commands run, and linked issues when available. Include screenshots for visible `apps/web` changes and call out database, Redis, or configuration changes explicitly. Do not commit secrets; Docker credentials in `infra/docker/docker-compose.yml` are local development defaults only.
