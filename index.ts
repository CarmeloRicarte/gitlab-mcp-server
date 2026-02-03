#!/usr/bin/env bun
// Re-export from src for backwards compatibility
export * from "./src/server.ts";
export * from "./src/client/gitlab-client.ts";
export * from "./src/types/gitlab.ts";

// If run directly, start the server
import { startServer } from "./src/server.ts";

startServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
