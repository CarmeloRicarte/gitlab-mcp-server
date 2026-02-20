import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { encodeProjectPath } from "../client/gitlab-client.ts";
import type { GitLabIssue, IssueSummary } from "../types/gitlab.ts";

export function registerIssueTools(server: McpServer, client: GitLabClient) {
  server.registerTool(
    "create_issue",
    {
      description: "Create a new issue in a GitLab project",
      inputSchema: {
        project: z.string().describe("Project ID or path"),
        title: z.string().describe("Issue title"),
        description: z
          .string()
          .optional()
          .describe("Issue description (markdown)"),
        labels: z.string().optional().describe("Comma-separated labels"),
      },
    },
    async ({ project, title, description, labels }) => {
      const body: Record<string, unknown> = { title };
      if (description) body.description = description;
      if (labels) body.labels = labels;

      const data = await client.post<GitLabIssue>(
        `/projects/${encodeProjectPath(project)}/issues`,
        body,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `Issue #${data.iid} created: ${data.web_url}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_issues",
    {
      description: "List issues in a GitLab project",
      inputSchema: {
        project: z.string().describe("Project ID or path"),
        state: z.enum(["opened", "closed", "all"]).optional().default("opened"),
        search: z
          .string()
          .optional()
          .describe("Search in title and description"),
        per_page: z.number().optional().default(20),
      },
    },
    async ({ project, state, search, per_page }) => {
      const params = new URLSearchParams({
        state: state || "opened",
        per_page: String(per_page || 20),
      });
      if (search) params.set("search", search);

      const issues = await client.get<GitLabIssue[]>(
        `/projects/${encodeProjectPath(project)}/issues?${params}`,
      );
      const result: IssueSummary[] = issues.map((i) => ({
        iid: i.iid,
        title: i.title,
        state: i.state,
        web_url: i.web_url,
        labels: i.labels,
        created_at: i.created_at,
      }));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );
}
