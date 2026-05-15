export type ApiHealth = {
  status: "ok";
  service: "api" | "worker" | "web";
};
