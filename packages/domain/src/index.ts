export const userGameStatuses = [
  "backlog",
  "wishlist",
  "jogando",
  "finalizado",
  "dropado",
  "pausado"
] as const;

export type UserGameStatus = (typeof userGameStatuses)[number];

export type UserGame = {
  id: string;
  userId: string;
  title: string;
  platform: string;
  coverUrl?: string;
  status: UserGameStatus;
  hoursPlayed: number;
  completionPercentage: number;
  notes: string;
  addedAt: string;
  updatedAt: string;
};

export type CreateUserGameInput = {
  title: string;
  platform?: string;
  coverUrl?: string;
  status?: UserGameStatus;
  hoursPlayed?: number;
  completionPercentage?: number;
  notes?: string;
};

export type UpdateUserGameInput = Partial<CreateUserGameInput>;

export const defaultLibraryStatus: UserGameStatus = "backlog";

export const userGameStatusLabels: Record<UserGameStatus, string> = {
  backlog: "Backlog",
  wishlist: "Wishlist",
  jogando: "Playing",
  finalizado: "Completed",
  dropado: "Dropped",
  pausado: "Paused"
};

export function isUserGameStatus(value: unknown): value is UserGameStatus {
  return typeof value === "string" && userGameStatuses.includes(value as UserGameStatus);
}

export function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalizeNonNegativeNumber(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return fallback;
  }

  return Number(numberValue.toFixed(1));
}

export function normalizeCompletionPercentage(value: unknown, fallback = 0) {
  const numberValue = normalizeNonNegativeNumber(value, fallback);
  return Math.min(100, Math.max(0, Math.round(numberValue)));
}

export function validateCreateUserGameInput(input: CreateUserGameInput) {
  const title = normalizeText(input.title);

  if (!title) {
    return { valid: false as const, error: "Title is required." };
  }

  const status = input.status ?? defaultLibraryStatus;

  if (!isUserGameStatus(status)) {
    return { valid: false as const, error: "Status is invalid." };
  }

  return {
    valid: true as const,
    value: {
      title,
      platform: normalizeText(input.platform) || "Unknown",
      coverUrl: normalizeText(input.coverUrl) || undefined,
      status,
      hoursPlayed: normalizeNonNegativeNumber(input.hoursPlayed),
      completionPercentage: normalizeCompletionPercentage(input.completionPercentage),
      notes: normalizeText(input.notes)
    }
  };
}

export function applyUserGameUpdate(game: UserGame, input: UpdateUserGameInput, updatedAt: string) {
  const nextStatus = input.status ?? game.status;

  if (!isUserGameStatus(nextStatus)) {
    return { valid: false as const, error: "Status is invalid." };
  }

  const nextTitle = input.title === undefined ? game.title : normalizeText(input.title);

  if (!nextTitle) {
    return { valid: false as const, error: "Title is required." };
  }

  return {
    valid: true as const,
    value: {
      ...game,
      title: nextTitle,
      platform: input.platform === undefined ? game.platform : normalizeText(input.platform) || "Unknown",
      coverUrl: input.coverUrl === undefined ? game.coverUrl : normalizeText(input.coverUrl) || undefined,
      status: nextStatus,
      hoursPlayed:
        input.hoursPlayed === undefined
          ? game.hoursPlayed
          : normalizeNonNegativeNumber(input.hoursPlayed, game.hoursPlayed),
      completionPercentage:
        input.completionPercentage === undefined
          ? game.completionPercentage
          : normalizeCompletionPercentage(input.completionPercentage, game.completionPercentage),
      notes: input.notes === undefined ? game.notes : normalizeText(input.notes),
      updatedAt
    }
  };
}

export function createUserGame(params: {
  id: string;
  userId: string;
  input: CreateUserGameInput;
  now: string;
}) {
  const validation = validateCreateUserGameInput(params.input);

  if (!validation.valid) {
    return validation;
  }

  return {
    valid: true as const,
    value: {
      id: params.id,
      userId: params.userId,
      ...validation.value,
      addedAt: params.now,
      updatedAt: params.now
    } satisfies UserGame
  };
}
