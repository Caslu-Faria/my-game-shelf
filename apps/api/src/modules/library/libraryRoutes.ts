import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type {
  CreateLibraryGameRequest,
  LibraryGameResponse,
  LibraryGameListResponse,
  UpdateLibraryGameRequest
} from "@my-game-shelf/contracts";

import { LibraryRepository } from "./libraryRepository.ts";

type JsonBody = Record<string, unknown>;

const repository = new LibraryRepository();

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(body));
}

function sendNoContent(response: ServerResponse) {
  response.writeHead(204, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": "*"
  });
  response.end();
}

function isJsonBody(value: unknown): value is JsonBody {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function readJsonBody(request: IncomingMessage) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (body.length > 100_000) {
      throw new Error("Request body is too large.");
    }
  }

  if (!body.trim()) {
    return {};
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new SyntaxError("Request body must be valid JSON.");
  }
}

function getLibraryGameId(pathname: string) {
  const match = pathname.match(/^\/library\/games\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function handleLibraryGames(request: IncomingMessage, response: ServerResponse, pathname: string) {
  if (request.method === "GET" && pathname === "/library/games") {
    const body: LibraryGameListResponse = { data: repository.list() };
    sendJson(response, 200, body);
    return;
  }

  if (request.method === "POST" && pathname === "/library/games") {
    const body = await readJsonBody(request);

    if (!isJsonBody(body)) {
      sendJson(response, 400, { error: "Request body must be a JSON object." });
      return;
    }

    const created = repository.create(body as CreateLibraryGameRequest);

    if (!created.valid) {
      sendJson(response, 400, { error: created.error });
      return;
    }

    const responseBody: LibraryGameResponse = { data: created.value };
    sendJson(response, 201, responseBody);
    return;
  }

  const gameId = getLibraryGameId(pathname);

  if (!gameId) {
    sendJson(response, 404, { error: "Route was not found." });
    return;
  }

  if (request.method === "GET") {
    const game = repository.get(gameId);

    if (!game) {
      sendJson(response, 404, { error: "Game was not found." });
      return;
    }

    const body: LibraryGameResponse = { data: game };
    sendJson(response, 200, body);
    return;
  }

  if (request.method === "PATCH") {
    const body = await readJsonBody(request);

    if (!isJsonBody(body)) {
      sendJson(response, 400, { error: "Request body must be a JSON object." });
      return;
    }

    const updated = repository.update(gameId, body as UpdateLibraryGameRequest);

    if (!updated.valid) {
      sendJson(response, updated.error === "Game was not found." ? 404 : 400, { error: updated.error });
      return;
    }

    const responseBody: LibraryGameResponse = { data: updated.value };
    sendJson(response, 200, responseBody);
    return;
  }

  if (request.method === "DELETE") {
    if (!repository.delete(gameId)) {
      sendJson(response, 404, { error: "Game was not found." });
      return;
    }

    sendNoContent(response);
    return;
  }

  sendJson(response, 405, { error: "Method is not allowed." });
}

export function createApiServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    try {
      if (request.method === "OPTIONS") {
        sendNoContent(response);
        return;
      }

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { status: "ok", service: "api" });
        return;
      }

      if (url.pathname === "/library/games" || url.pathname.startsWith("/library/games/")) {
        await handleLibraryGames(request, response, url.pathname);
        return;
      }

      sendJson(response, 404, {
        error: "Route was not found.",
        routes: ["GET /health", "GET /library/games", "POST /library/games", "GET/PATCH/DELETE /library/games/:id"]
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected server error.";
      sendJson(response, message.includes("JSON") ? 400 : 500, { error: message });
    }
  });
}
