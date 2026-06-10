import { randomUUID } from "node:crypto";

import {
  applyUserGameUpdate,
  createUserGame,
  type CreateUserGameInput,
  type UpdateUserGameInput,
  type UserGame
} from "@my-game-shelf/domain";

const localUserId = "local-user";

const seedGames: Array<CreateUserGameInput & { id: string }> = [
  {
    id: "game-hades",
    title: "Hades",
    platform: "PC",
    status: "jogando",
    hoursPlayed: 18,
    completionPercentage: 45,
    notes: "Focus on mirror upgrades before another escape attempt."
  },
  {
    id: "game-celeste",
    title: "Celeste",
    platform: "Switch",
    status: "finalizado",
    hoursPlayed: 12,
    completionPercentage: 100,
    notes: "Main story complete. B-sides are optional backlog."
  },
  {
    id: "game-disco-elysium",
    title: "Disco Elysium",
    platform: "PC",
    status: "backlog",
    hoursPlayed: 0,
    completionPercentage: 0,
    notes: "Start after finishing current RPG."
  }
];

export class LibraryRepository {
  private games = new Map<string, UserGame>();

  constructor() {
    const now = new Date().toISOString();

    for (const seedGame of seedGames) {
      const created = createUserGame({
        id: seedGame.id,
        userId: localUserId,
        input: seedGame,
        now
      });

      if (created.valid) {
        this.games.set(created.value.id, created.value);
      }
    }
  }

  list() {
    return [...this.games.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  get(id: string) {
    return this.games.get(id) ?? null;
  }

  create(input: CreateUserGameInput) {
    const now = new Date().toISOString();
    const created = createUserGame({
      id: randomUUID(),
      userId: localUserId,
      input,
      now
    });

    if (!created.valid) {
      return created;
    }

    this.games.set(created.value.id, created.value);
    return created;
  }

  update(id: string, input: UpdateUserGameInput) {
    const current = this.get(id);

    if (!current) {
      return { valid: false as const, error: "Game was not found." };
    }

    const updated = applyUserGameUpdate(current, input, new Date().toISOString());

    if (!updated.valid) {
      return updated;
    }

    this.games.set(id, updated.value);
    return updated;
  }

  delete(id: string) {
    return this.games.delete(id);
  }
}
