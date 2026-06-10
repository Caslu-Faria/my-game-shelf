"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  userGameStatusLabels,
  userGameStatuses,
  type CreateLibraryGameRequest,
  type LibraryGameDto,
  type LibraryStatusDto,
  type UpdateLibraryGameRequest
} from "@my-game-shelf/contracts";

type FormState = {
  title: string;
  platform: string;
  coverUrl: string;
  status: LibraryStatusDto;
  hoursPlayed: string;
  completionPercentage: string;
  notes: string;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

const fallbackGames: LibraryGameDto[] = [
  {
    id: "local-hades",
    userId: "local-user",
    title: "Hades",
    platform: "PC",
    status: "jogando",
    hoursPlayed: 18,
    completionPercentage: 45,
    notes: "Focus on mirror upgrades before another escape attempt.",
    addedAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-01-01T12:00:00.000Z"
  },
  {
    id: "local-celeste",
    userId: "local-user",
    title: "Celeste",
    platform: "Switch",
    status: "finalizado",
    hoursPlayed: 12,
    completionPercentage: 100,
    notes: "Main story complete. B-sides are optional backlog.",
    addedAt: "2026-01-02T12:00:00.000Z",
    updatedAt: "2026-01-02T12:00:00.000Z"
  },
  {
    id: "local-disco-elysium",
    userId: "local-user",
    title: "Disco Elysium",
    platform: "PC",
    status: "backlog",
    hoursPlayed: 0,
    completionPercentage: 0,
    notes: "Start after finishing current RPG.",
    addedAt: "2026-01-03T12:00:00.000Z",
    updatedAt: "2026-01-03T12:00:00.000Z"
  }
];

const emptyForm: FormState = {
  title: "",
  platform: "",
  coverUrl: "",
  status: "backlog",
  hoursPlayed: "0",
  completionPercentage: "0",
  notes: ""
};

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}`;
}

function toFormState(game: LibraryGameDto): FormState {
  return {
    title: game.title,
    platform: game.platform,
    coverUrl: game.coverUrl ?? "",
    status: game.status,
    hoursPlayed: String(game.hoursPlayed),
    completionPercentage: String(game.completionPercentage),
    notes: game.notes
  };
}

function toPayload(form: FormState): CreateLibraryGameRequest {
  return {
    title: form.title,
    platform: form.platform,
    coverUrl: form.coverUrl,
    status: form.status,
    hoursPlayed: Number(form.hoursPlayed),
    completionPercentage: Number(form.completionPercentage),
    notes: form.notes
  };
}

function createLocalGame(payload: CreateLibraryGameRequest): LibraryGameDto {
  const now = new Date().toISOString();

  return {
    id: createLocalId(),
    userId: "local-user",
    title: payload.title.trim(),
    platform: payload.platform?.trim() || "Unknown",
    coverUrl: payload.coverUrl?.trim() || undefined,
    status: payload.status ?? "backlog",
    hoursPlayed: Math.max(0, Number(payload.hoursPlayed ?? 0)),
    completionPercentage: Math.min(100, Math.max(0, Number(payload.completionPercentage ?? 0))),
    notes: payload.notes?.trim() ?? "",
    addedAt: now,
    updatedAt: now
  };
}

function applyLocalUpdate(game: LibraryGameDto, payload: UpdateLibraryGameRequest): LibraryGameDto {
  const next = createLocalGame({
    title: payload.title ?? game.title,
    platform: payload.platform ?? game.platform,
    coverUrl: payload.coverUrl ?? game.coverUrl,
    status: payload.status ?? game.status,
    hoursPlayed: payload.hoursPlayed ?? game.hoursPlayed,
    completionPercentage: payload.completionPercentage ?? game.completionPercentage,
    notes: payload.notes ?? game.notes
  });

  return {
    ...next,
    id: game.id,
    userId: game.userId,
    addedAt: game.addedAt
  };
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export default function HomePage() {
  const [games, setGames] = useState<LibraryGameDto[]>(fallbackGames);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LibraryStatusDto>("all");
  const [apiState, setApiState] = useState<"checking" | "connected" | "local">("checking");

  useEffect(() => {
    let active = true;

    requestJson<{ data: LibraryGameDto[] }>("/library/games")
      .then((body) => {
        if (!active) {
          return;
        }

        setGames(body.data);
        setApiState("connected");
      })
      .catch(() => {
        if (active) {
          setApiState("local");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return games.filter((game) => {
      const matchesStatus = statusFilter === "all" || game.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        game.title.toLowerCase().includes(normalizedQuery) ||
        game.platform.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [games, query, statusFilter]);

  const totals = useMemo(() => {
    const statusTotals = Object.fromEntries(userGameStatuses.map((status) => [status, 0])) as Record<
      LibraryStatusDto,
      number
    >;

    for (const game of games) {
      statusTotals[game.status] += 1;
    }

    return {
      games: games.length,
      hours: games.reduce((sum, game) => sum + game.hoursPlayed, 0),
      completed: statusTotals.finalizado,
      playing: statusTotals.jogando
    };
  }, [games]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = toPayload(form);

    if (!payload.title.trim()) {
      return;
    }

    if (editingId) {
      try {
        const body = await requestJson<{ data: LibraryGameDto }>(`/library/games/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setGames((current) => current.map((game) => (game.id === editingId ? body.data : game)));
        setApiState("connected");
      } catch {
        setGames((current) => current.map((game) => (game.id === editingId ? applyLocalUpdate(game, payload) : game)));
        setApiState("local");
      }
    } else {
      try {
        const body = await requestJson<{ data: LibraryGameDto }>("/library/games", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setGames((current) => [body.data, ...current]);
        setApiState("connected");
      } catch {
        setGames((current) => [createLocalGame(payload), ...current]);
        setApiState("local");
      }
    }

    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(game: LibraryGameDto) {
    setEditingId(game.id);
    setForm(toFormState(game));
  }

  async function handleDelete(id: string) {
    try {
      await requestJson<null>(`/library/games/${id}`, { method: "DELETE" });
      setApiState("connected");
    } catch {
      setApiState("local");
    }

    setGames((current) => current.filter((game) => game.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }

  return (
    <main className="app-shell">
      <section className="library-header" aria-labelledby="library-title">
        <div>
          <p className="eyebrow">My Game Shelf</p>
          <h1 id="library-title">Library</h1>
        </div>
        <div className={`sync-pill sync-pill--${apiState}`}>
          {apiState === "checking" ? "Checking API" : apiState === "connected" ? "API connected" : "Local mode"}
        </div>
      </section>

      <section className="stats-grid" aria-label="Library totals">
        <div className="stat-box">
          <span>Total games</span>
          <strong>{totals.games}</strong>
        </div>
        <div className="stat-box">
          <span>Playing</span>
          <strong>{totals.playing}</strong>
        </div>
        <div className="stat-box">
          <span>Completed</span>
          <strong>{totals.completed}</strong>
        </div>
        <div className="stat-box">
          <span>Hours logged</span>
          <strong>{totals.hours.toFixed(1)}</strong>
        </div>
      </section>

      <section className="library-layout">
        <form className="game-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{editingId ? "Edit game" : "Add game"}</h2>
            {editingId ? (
              <button
                type="button"
                className="button button-ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Outer Wilds"
              required
            />
          </label>

          <label>
            Platform
            <input
              value={form.platform}
              onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
              placeholder="PC, Switch, PS5"
            />
          </label>

          <label>
            Cover URL
            <input
              value={form.coverUrl}
              onChange={(event) => setForm((current) => ({ ...current, coverUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as LibraryStatusDto }))
              }
            >
              {userGameStatuses.map((status) => (
                <option key={status} value={status}>
                  {userGameStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <div className="field-row">
            <label>
              Hours
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.hoursPlayed}
                onChange={(event) => setForm((current) => ({ ...current, hoursPlayed: event.target.value }))}
              />
            </label>
            <label>
              Progress
              <input
                type="number"
                min="0"
                max="100"
                value={form.completionPercentage}
                onChange={(event) =>
                  setForm((current) => ({ ...current, completionPercentage: event.target.value }))
                }
              />
            </label>
          </div>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              placeholder="Current goal, save location, or backlog reason"
            />
          </label>

          <button type="submit" className="button button-primary">
            {editingId ? "Save changes" : "Add to library"}
          </button>
        </form>

        <section className="game-list-section" aria-labelledby="games-title">
          <div className="list-toolbar">
            <h2 id="games-title">Shelf</h2>
            <div className="filters">
              <input
                aria-label="Search games"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
              />
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | LibraryStatusDto)}
              >
                <option value="all">All statuses</option>
                {userGameStatuses.map((status) => (
                  <option key={status} value={status}>
                    {userGameStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="game-grid">
            {filteredGames.map((game) => (
              <article className="game-card" key={game.id}>
                <div
                  className={`cover-frame${game.coverUrl ? " cover-frame--image" : ""}`}
                  style={game.coverUrl ? { backgroundImage: `url(${game.coverUrl})` } : undefined}
                  aria-hidden="true"
                >
                  {game.coverUrl ? null : <span>{game.title.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="game-card-body">
                  <div className="game-title-row">
                    <div>
                      <h3>{game.title}</h3>
                      <p>{game.platform}</p>
                    </div>
                    <span className={`status-chip status-chip--${game.status}`}>{userGameStatusLabels[game.status]}</span>
                  </div>

                  <div className="progress-block">
                    <div>
                      <span>{game.hoursPlayed.toFixed(1)}h</span>
                      <span>{game.completionPercentage}%</span>
                    </div>
                    <progress value={game.completionPercentage} max={100} />
                  </div>

                  {game.notes ? <p className="notes">{game.notes}</p> : null}

                  <div className="card-actions">
                    <button type="button" className="button button-secondary" onClick={() => handleEdit(game)}>
                      Edit
                    </button>
                    <button type="button" className="button button-danger" onClick={() => handleDelete(game.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredGames.length === 0 ? <p className="empty-state">No games match the current filters.</p> : null}
        </section>
      </section>
    </main>
  );
}
