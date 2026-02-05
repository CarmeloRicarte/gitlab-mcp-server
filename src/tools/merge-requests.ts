import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { encodeProjectPath } from "../client/gitlab-client.ts";
import type {
  GitLabMergeRequest,
  MergeRequestSummary,
} from "../types/gitlab.ts";

export function registerMergeRequestTools(
  server: McpServer,
  client: GitLabClient,
) {
  server.registerTool(
    "create_merge_request",
    {
      description: "Create a merge request in a GitLab project",
      inputSchema: {
        project: z.string().describe("Project ID or path"),
        source_branch: z.string().describe("Source branch name"),
        target_branch: z
          .string()
          .optional()
          .default("main")
          .describe("Target branch name"),
        title: z.string().describe("MR title"),
        description: z
          .string()
          .optional()
          .describe("MR description (markdown)"),
        remove_source_branch: z.boolean().optional().default(true),
      },
    },
    async ({
      project,
      source_branch,
      target_branch,
      title,
      description,
      remove_source_branch,
    }) => {
      const body: Record<string, unknown> = {
        source_branch,
        target_branch: target_branch || "main",
        title,
        remove_source_branch: remove_source_branch ?? true,
      };
      if (description) body.description = description;

      const data = await client.post<GitLabMergeRequest>(
        `/projects/${encodeProjectPath(project)}/merge_requests`,
        body,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `Merge Request !${data.iid} created: ${data.web_url}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_merge_requests",
    {
      description: "List merge requests in a GitLab project",
      inputSchema: {
        project: z.string().describe("Project ID or path"),
        state: z
          .enum(["opened", "closed", "merged", "all"])
          .optional()
          .default("opened"),
        per_page: z.number().optional().default(20),
      },
    },
    async ({ project, state, per_page }) => {
      const params = new URLSearchParams({
        state: state || "opened",
        per_page: String(per_page || 20),
      });

      const mrs = await client.get<GitLabMergeRequest[]>(
        `/projects/${encodeProjectPath(project)}/merge_requests?${params}`,
      );
      const result: MergeRequestSummary[] = mrs.map((mr) => ({
        iid: mr.iid,
        title: mr.title,
        state: mr.state,
        source_branch: mr.source_branch,
        target_branch: mr.target_branch,
        web_url: mr.web_url,
        author: mr.author?.username,
      }));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );
}
