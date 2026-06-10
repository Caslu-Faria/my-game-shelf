# API modules

Organize o backend como modular monolith.

Modulos previstos:

- `auth`
- `users`
- `catalog`
- `library`
- `progress`
- `notes`
- `tasks`
- `integrations/steam`

Mantenha controllers finos e regras no dominio/casos de uso.

## Library MVP

O modulo `library` expoe a primeira fatia vertical em memoria:

- `GET /library/games`
- `POST /library/games`
- `GET /library/games/:id`
- `PATCH /library/games/:id`
- `DELETE /library/games/:id`

Use `packages/domain` para regras de status, normalizacao e validacao. Use
`packages/contracts` para os formatos de request e response compartilhados com
o frontend.
