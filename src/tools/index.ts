import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { registerProjectTools } from "./projects.ts";
import { registerBranchTools } from "./branches.ts";
import { registerIssueTools } from "./issues.ts";
import { registerMergeRequestTools } from "./merge-requests.ts";
import { registerFileTools } from "./files.ts";
import { registerSearchTools } from "./search.ts";

export function registerAllTools(server: McpServer, client: GitLabClient) {
	registerProjectTools(server, client);
	registerBranchTools(server, client);
	registerIssueTools(server, client);
	registerMergeRequestTools(server, client);
	registerFileTools(server, client);
	registerSearchTools(server, client);
}

export {
	registerProjectTools,
	registerBranchTools,
	registerIssueTools,
	registerMergeRequestTools,
	registerFileTools,
	registerSearchTools,
};
