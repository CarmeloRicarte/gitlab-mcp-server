import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { encodeProjectPath } from "../client/gitlab-client.ts";
import type { GitLabProject, ProjectSummary } from "../types/gitlab.ts";

export function registerProjectTools(server: McpServer, client: GitLabClient) {
  server.registerTool(
    "list_projects",
    {
      description: "List GitLab projects accessible to the user",
      inputSchema: z.object({
        search: z
          .string()
          .optional()
          .describe("Search query to filter projects"),
        per_page: z
          .number()
          .optional()
          .default(20)
          .describe("Number of results per page"),
      }),
    },
    async ({ search, per_page }) => {
      const params = new URLSearchParams({ per_page: String(per_page || 20) });
      if (search) params.set("search", search);

      const projects = await client.get<GitLabProject[]>(`/projects?${params}`);
      const result: ProjectSummary[] = projects.map((p) => ({
        id: p.id,
        name: p.name,
        path_with_namespace: p.path_with_namespace,
        web_url: p.web_url,
        default_branch: p.default_branch,
      }));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );

  server.registerTool(
    "get_project",
    {
      description: "Get details of a specific GitLab project",
      inputSchema: z.object({
        project: z
          .string()
          .describe("Project ID or path (e.g., 'group/project')"),
      }),
    },
    async ({ project }) => {
      const data = await client.get<GitLabProject>(
        `/projects/${encodeProjectPath(project)}`,
      );
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(data, null, 2) },
        ],
      };
    },
  );
}
