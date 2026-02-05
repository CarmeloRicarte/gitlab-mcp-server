import { describe, expect, it, mock, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchTools } from "../../src/tools/search.ts";
import { createMockClient, mockSearchResult } from "../setup.ts";

describe("Search Tools", () => {
  let server: McpServer;
  let registeredTools: Map<string, { handler: Function }>;

  beforeEach(() => {
    registeredTools = new Map();
    server = {
      registerTool: mock(
        (name: string, _config: unknown, handler: Function) => {
          registeredTools.set(name, { handler });
        },
      ),
    } as unknown as McpServer;
  });

  describe("search_code", () => {
    it("should register search_code tool", () => {
      const client = createMockClient();
      registerSearchTools(server, client);

      expect(registeredTools.has("search_code")).toBe(true);
    });

    it("should call client.get with search params", async () => {
      const getMock = mock(() => Promise.resolve([mockSearchResult()]));
      const client = createMockClient({ get: getMock });
      registerSearchTools(server, client);

      const tool = registeredTools.get("search_code")!;
      await tool.handler({
        project: "group/project",
        search: "function test",
        per_page: 30,
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/group%2Fproject/search?scope=blobs&search=function+test&per_page=30",
      );
    });

    it("should return formatted search results", async () => {
      const results = [
        mockSearchResult({
          filename: "utils.ts",
          path: "src/utils.ts",
          startline: 10,
          data: "export function helper() {}",
        }),
        mockSearchResult({
          filename: "index.ts",
          path: "src/index.ts",
          startline: 5,
          data: "import { helper } from './utils';",
        }),
      ];
      const client = createMockClient({
        get: mock(() => Promise.resolve(results)),
      });
      registerSearchTools(server, client);

      const tool = registeredTools.get("search_code")!;
      const result = await tool.handler({
        project: "1",
        search: "helper",
        per_page: 20,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].filename).toBe("utils.ts");
      expect(parsed[0].path).toBe("src/utils.ts");
      expect(parsed[0].startline).toBe(10);
      expect(parsed[1].filename).toBe("index.ts");
    });

    it("should use default per_page when not provided", async () => {
      const getMock = mock(() => Promise.resolve([]));
      const client = createMockClient({ get: getMock });
      registerSearchTools(server, client);

      const tool = registeredTools.get("search_code")!;
      await tool.handler({
        project: "1",
        search: "test",
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/1/search?scope=blobs&search=test&per_page=20",
      );
    });

    it("should handle empty results", async () => {
      const client = createMockClient({
        get: mock(() => Promise.resolve([])),
      });
      registerSearchTools(server, client);

      const tool = registeredTools.get("search_code")!;
      const result = await tool.handler({
        project: "1",
        search: "nonexistent",
        per_page: 20,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual([]);
    });
  });
});
