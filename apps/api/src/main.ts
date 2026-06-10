import { createApiServer } from "./modules/library/libraryRoutes.ts";

const port = Number(process.env.PORT ?? 3001);
const server = createApiServer();

server.listen(port, () => {
  console.log(`my-game-shelf api listening on http://localhost:${port}`);
});
