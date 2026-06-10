import type {
  CreateUserGameInput,
  UpdateUserGameInput,
  UserGame,
  UserGameStatus
} from "@my-game-shelf/domain";

export {
  defaultLibraryStatus,
  userGameStatusLabels,
  userGameStatuses
} from "@my-game-shelf/domain";

export type ApiHealth = {
  status: "ok";
  service: "api" | "worker" | "web";
};

export type LibraryGameDto = UserGame;

export type LibraryStatusDto = UserGameStatus;

export type CreateLibraryGameRequest = CreateUserGameInput;

export type UpdateLibraryGameRequest = UpdateUserGameInput;

export type LibraryGameListResponse = {
  data: LibraryGameDto[];
};

export type LibraryGameResponse = {
  data: LibraryGameDto;
};

export type ApiErrorResponse = {
  error: string;
};
