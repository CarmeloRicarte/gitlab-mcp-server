import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GitLabClient } from "./client/gitlab-client.ts";
import { config } from "./config.ts";
import { registerAllTools } from "./tools/index.ts";

const SERVER_NAME = "gitlab-ce";
const SERVER_VERSION = "1.0.0";

export function createServer(client?: GitLabClient) {
	const server = new McpServer({
		name: SERVER_NAME,
		version: SERVER_VERSION,
	});

	const gitlabClient = client ?? GitLabClient.fromConfig(config);
	registerAllTools(server, gitlabClient);

	return server;
}

export async function startServer() {
	const server = createServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("GitLab MCP Server running on stdio");
}
