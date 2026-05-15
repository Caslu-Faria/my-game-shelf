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
  gameId: string;
  status: UserGameStatus;
  hoursPlayed: number;
  completionPercentage: number;
};
