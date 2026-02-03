import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { encodeProjectPath } from "../client/gitlab-client.ts";
import type { GitLabSearchResult, SearchResultSummary } from "../types/gitlab.ts";

export function registerSearchTools(server: McpServer, client: GitLabClient) {
  server.tool(
    "search_code",
    "Search for code in a GitLab project",
    {
      project: z.string().describe("Project ID or path"),
      search: z.string().describe("Search query"),
      per_page: z.number().optional().default(20),
    },
    async ({ project, search, per_page }) => {
      const params = new URLSearchParams({
        scope: "blobs",
        search,
        per_page: String(per_page || 20),
      });

      const results = await client.get<GitLabSearchResult[]>(
        `/projects/${encodeProjectPath(project)}/search?${params}`
      );
      const formatted: SearchResultSummary[] = results.map((r) => ({
        filename: r.filename,
        path: r.path,
        ref: r.ref,
        startline: r.startline,
        data: r.data,
      }));

      return {
        content: [{ type: "text" as const, text: JSON.stringify(formatted, null, 2) }],
      };
    }
  );
}
