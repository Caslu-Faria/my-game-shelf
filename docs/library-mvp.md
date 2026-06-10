# Library MVP

The Library MVP lets a local user view, add, edit, delete, search, and filter games in a personal shelf. It is the first vertical slice for the `library` module and uses in-memory API storage until the database package is implemented.

## Scope

- Manage game title, platform, optional cover URL, status, hours played, completion percentage, and notes.
- Use the existing statuses from `packages/domain`: `backlog`, `wishlist`, `jogando`, `finalizado`, `dropado`, and `pausado`.
- Keep one local user (`local-user`) for now. Authentication and multi-user isolation are future work.

## API

Run the API with:

```bash
npm run dev:api
```

Default base URL: `http://localhost:3001`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check. |
| `GET` | `/library/games` | List shelf games. |
| `POST` | `/library/games` | Add a game. |
| `GET` | `/library/games/:id` | Read one game. |
| `PATCH` | `/library/games/:id` | Update a game. |
| `DELETE` | `/library/games/:id` | Remove a game. |

Example create request:

```json
{
  "title": "Outer Wilds",
  "platform": "PC",
  "status": "backlog",
  "hoursPlayed": 0,
  "completionPercentage": 0,
  "notes": "Start after finishing current run."
}
```

## Web App

Run the web app with:

```bash
npm run dev:web
```

The page loads `/library/games` from `NEXT_PUBLIC_API_URL` or `http://localhost:3001`. If the API is unavailable, the UI switches to local mode and keeps changes in browser state for the current session.

## Shared Packages

- `packages/domain`: source of truth for library statuses, game types, input normalization, and validation helpers.
- `packages/contracts`: API DTOs and request/response shapes used by the web and API layers.

## Current Limitations

- API data resets when the process restarts.
- No authentication, authorization, or user selection.
- No database migrations or Prisma models yet.
- No automated tests are configured yet; keep `npm run typecheck` passing when tooling is available.
