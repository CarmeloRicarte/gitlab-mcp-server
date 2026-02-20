import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import type { GitLabUser, UserSummary } from "../types/gitlab.ts";

export function registerUserTools(server: McpServer, client: GitLabClient) {
	server.registerTool(
		"search_users",
		{
			description:
				"Search for GitLab users by username or name. Use this to resolve usernames to user IDs for assignee/reviewer assignment.",
			inputSchema: {
				search: z.string().describe("Username or name to search for"),
				per_page: z.number().optional().default(20),
			},
		},
		async ({ search, per_page }) => {
			const params = new URLSearchParams({
				search,
				per_page: String(per_page || 20),
			});

			const users = await client.get<GitLabUser[]>(`/users?${params}`);
			const result: UserSummary[] = users.map((u) => ({
				id: u.id,
				username: u.username,
				name: u.name,
				state: u.state,
			}));

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		},
	);
}
