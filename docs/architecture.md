# Arquitetura proposta para o produto Game Shelf

## Resumo

- monorepo com `apps/web`, `apps/api`, `apps/worker`
- backend como modular monolith
- `packages/*` para contratos, dominio, UI, banco e configuracao
- `PostgreSQL` como banco principal
- `Redis` para filas, caches curtos e orquestracao de jobs
- Steam tratada como integracao externa, nunca como fonte unica da verdade

## Regras

- organizar backend por modulos de dominio
- manter frontend por feature antes de tipo tecnico
- manter dados internos do usuario separados de dados importados
- evitar microservicos e abstracoes prematuras
