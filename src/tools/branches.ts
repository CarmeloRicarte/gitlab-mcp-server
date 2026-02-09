import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { encodeProjectPath } from "../client/gitlab-client.ts";
import type { GitLabBranch, BranchSummary } from "../types/gitlab.ts";

export function registerBranchTools(server: McpServer, client: GitLabClient) {
  server.registerTool(
    "list_branches",
    {
      description: "List branches in a GitLab project",
      inputSchema: z.object({
        project: z.string().describe("Project ID or path"),
        search: z
          .string()
          .optional()
          .describe("Search query to filter branches"),
      }),
    },
    async ({ project, search }) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const branches = await client.get<GitLabBranch[]>(
        `/projects/${encodeProjectPath(project)}/repository/branches?${params}`,
      );
      const result: BranchSummary[] = branches.map((b) => ({
        name: b.name,
        protected: b.protected,
        commit_sha: b.commit?.short_id,
        commit_message: b.commit?.title,
      }));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );

  server.registerTool(
    "create_branch",
    {
      description: "Create a new branch in a GitLab project",
      inputSchema: z.object({
        project: z.string().describe("Project ID or path"),
        branch: z.string().describe("Name of the new branch"),
        ref: z
          .string()
          .optional()
          .default("main")
          .describe("Source branch or commit SHA"),
      }),
    },
    async ({ project, branch, ref }) => {
      const data = await client.post<GitLabBranch>(
        `/projects/${encodeProjectPath(project)}/repository/branches`,
        { branch, ref },
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `Branch '${data.name}' created successfully from '${ref}'`,
          },
        ],
      };
    },
  );
}
