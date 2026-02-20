import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GitLabClient } from "../client/gitlab-client.ts";
import { encodeProjectPath } from "../client/gitlab-client.ts";
import type { GitLabFile } from "../types/gitlab.ts";

export function registerFileTools(server: McpServer, client: GitLabClient) {
  server.registerTool(
    "get_file",
    {
      description: "Get contents of a file from the repository",
      inputSchema: {
        project: z.string().describe("Project ID or path"),
        file_path: z.string().describe("Path to the file in the repository"),
        ref: z
          .string()
          .optional()
          .default("main")
          .describe("Branch or commit SHA"),
      },
    },
    async ({ project, file_path, ref }) => {
      const encodedPath = encodeURIComponent(file_path);
      const params = new URLSearchParams({ ref: ref || "main" });

      const data = await client.get<GitLabFile>(
        `/projects/${encodeProjectPath(project)}/repository/files/${encodedPath}?${params}`,
      );

      const content = Buffer.from(data.content, "base64").toString("utf-8");

      return {
        content: [{ type: "text" as const, text: content }],
      };
    },
  );

  server.registerTool(
    "create_or_update_file",
    {
      description: "Create or update a file in the repository",
      inputSchema: {
        project: z.string().describe("Project ID or path"),
        file_path: z.string().describe("Path to the file"),
        branch: z.string().describe("Branch to commit to"),
        content: z.string().describe("File content"),
        commit_message: z.string().describe("Commit message"),
        action: z.enum(["create", "update"]).optional().default("create"),
      },
    },
    async ({ project, file_path, branch, content, commit_message, action }) => {
      const encodedPath = encodeURIComponent(file_path);
      const endpoint = `/projects/${encodeProjectPath(project)}/repository/files/${encodedPath}`;
      const body = { branch, content, commit_message };

      if (action === "update") {
        await client.put(endpoint, body);
      } else {
        await client.post(endpoint, body);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `File '${file_path}' ${action === "update" ? "updated" : "created"} on branch '${branch}'`,
          },
        ],
      };
    },
  );
}
