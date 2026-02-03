import { describe, expect, it, mock, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFileTools } from "../../src/tools/files.ts";
import { createMockClient, mockFile } from "../setup.ts";

describe("File Tools", () => {
  let server: McpServer;
  let registeredTools: Map<string, { handler: Function }>;

  beforeEach(() => {
    registeredTools = new Map();
    server = {
      tool: mock((name: string, _desc: string, _schema: unknown, handler: Function) => {
        registeredTools.set(name, { handler });
      }),
    } as unknown as McpServer;
  });

  describe("get_file", () => {
    it("should register get_file tool", () => {
      const client = createMockClient();
      registerFileTools(server, client);

      expect(registeredTools.has("get_file")).toBe(true);
    });

    it("should call client.get with encoded file path", async () => {
      const getMock = mock(() => Promise.resolve(mockFile()));
      const client = createMockClient({ get: getMock });
      registerFileTools(server, client);

      const tool = registeredTools.get("get_file")!;
      await tool.handler({
        project: "group/project",
        file_path: "src/index.ts",
        ref: "main",
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/group%2Fproject/repository/files/src%2Findex.ts?ref=main"
      );
    });

    it("should decode base64 content", async () => {
      const fileContent = "console.log('Hello');";
      const file = mockFile({
        content: Buffer.from(fileContent).toString("base64"),
      });
      const client = createMockClient({
        get: mock(() => Promise.resolve(file)),
      });
      registerFileTools(server, client);

      const tool = registeredTools.get("get_file")!;
      const result = await tool.handler({
        project: "1",
        file_path: "index.js",
        ref: "main",
      });

      expect(result.content[0].text).toBe(fileContent);
    });

    it("should use default ref when not provided", async () => {
      const getMock = mock(() => Promise.resolve(mockFile()));
      const client = createMockClient({ get: getMock });
      registerFileTools(server, client);

      const tool = registeredTools.get("get_file")!;
      await tool.handler({
        project: "1",
        file_path: "README.md",
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/1/repository/files/README.md?ref=main"
      );
    });
  });

  describe("create_or_update_file", () => {
    it("should register create_or_update_file tool", () => {
      const client = createMockClient();
      registerFileTools(server, client);

      expect(registeredTools.has("create_or_update_file")).toBe(true);
    });

    it("should use POST for create action", async () => {
      const postMock = mock(() => Promise.resolve({}));
      const client = createMockClient({ post: postMock });
      registerFileTools(server, client);

      const tool = registeredTools.get("create_or_update_file")!;
      await tool.handler({
        project: "1",
        file_path: "new-file.ts",
        branch: "main",
        content: "export const x = 1;",
        commit_message: "Add new file",
        action: "create",
      });

      expect(postMock).toHaveBeenCalledWith(
        "/projects/1/repository/files/new-file.ts",
        {
          branch: "main",
          content: "export const x = 1;",
          commit_message: "Add new file",
        }
      );
    });

    it("should use PUT for update action", async () => {
      const putMock = mock(() => Promise.resolve({}));
      const client = createMockClient({ put: putMock });
      registerFileTools(server, client);

      const tool = registeredTools.get("create_or_update_file")!;
      await tool.handler({
        project: "1",
        file_path: "existing.ts",
        branch: "main",
        content: "updated content",
        commit_message: "Update file",
        action: "update",
      });

      expect(putMock).toHaveBeenCalledWith(
        "/projects/1/repository/files/existing.ts",
        {
          branch: "main",
          content: "updated content",
          commit_message: "Update file",
        }
      );
    });

    it("should return success message for create", async () => {
      const client = createMockClient({
        post: mock(() => Promise.resolve({})),
      });
      registerFileTools(server, client);

      const tool = registeredTools.get("create_or_update_file")!;
      const result = await tool.handler({
        project: "1",
        file_path: "test.ts",
        branch: "feature",
        content: "content",
        commit_message: "Add",
        action: "create",
      });

      expect(result.content[0].text).toContain("test.ts");
      expect(result.content[0].text).toContain("created");
      expect(result.content[0].text).toContain("feature");
    });

    it("should return success message for update", async () => {
      const client = createMockClient({
        put: mock(() => Promise.resolve({})),
      });
      registerFileTools(server, client);

      const tool = registeredTools.get("create_or_update_file")!;
      const result = await tool.handler({
        project: "1",
        file_path: "test.ts",
        branch: "main",
        content: "content",
        commit_message: "Update",
        action: "update",
      });

      expect(result.content[0].text).toContain("test.ts");
      expect(result.content[0].text).toContain("updated");
    });
  });
});
