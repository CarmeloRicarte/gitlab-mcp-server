#!/usr/bin/env bun
import { startServer } from "./server.ts";

startServer().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
