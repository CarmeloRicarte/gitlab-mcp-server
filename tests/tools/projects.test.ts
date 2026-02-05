import { describe, expect, it, mock, beforeEach } from "bun:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerProjectTools } from "../../src/tools/projects.ts";
import { createMockClient, mockProject } from "../setup.ts";

describe("Project Tools", () => {
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

  describe("list_projects", () => {
    it("should register list_projects tool", () => {
      const client = createMockClient();
      registerProjectTools(server, client);

      expect(registeredTools.has("list_projects")).toBe(true);
    });

    it("should call client.get with correct endpoint", async () => {
      const getMock = mock(() => Promise.resolve([mockProject()]));
      const client = createMockClient({ get: getMock });
      registerProjectTools(server, client);

      const tool = registeredTools.get("list_projects")!;
      await tool.handler({ per_page: 20 });

      expect(getMock).toHaveBeenCalledWith("/projects?per_page=20");
    });

    it("should include search param when provided", async () => {
      const getMock = mock(() => Promise.resolve([mockProject()]));
      const client = createMockClient({ get: getMock });
      registerProjectTools(server, client);

      const tool = registeredTools.get("list_projects")!;
      await tool.handler({ search: "test", per_page: 10 });

      expect(getMock).toHaveBeenCalledWith("/projects?per_page=10&search=test");
    });

    it("should return formatted project list", async () => {
      const projects = [
        mockProject({ id: 1, name: "project-1" }),
        mockProject({ id: 2, name: "project-2" }),
      ];
      const client = createMockClient({
        get: mock(() => Promise.resolve(projects)),
      });
      registerProjectTools(server, client);

      const tool = registeredTools.get("list_projects")!;
      const result = await tool.handler({ per_page: 20 });

      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe("project-1");
    });
  });

  describe("get_project", () => {
    it("should register get_project tool", () => {
      const client = createMockClient();
      registerProjectTools(server, client);

      expect(registeredTools.has("get_project")).toBe(true);
    });

    it("should call client.get with encoded project path", async () => {
      const getMock = mock(() => Promise.resolve(mockProject()));
      const client = createMockClient({ get: getMock });
      registerProjectTools(server, client);

      const tool = registeredTools.get("get_project")!;
      await tool.handler({ project: "group/project" });

      expect(getMock).toHaveBeenCalledWith("/projects/group%2Fproject");
    });

    it("should return project details", async () => {
      const project = mockProject({ id: 42, name: "my-project" });
      const client = createMockClient({
        get: mock(() => Promise.resolve(project)),
      });
      registerProjectTools(server, client);

      const tool = registeredTools.get("get_project")!;
      const result = await tool.handler({ project: "42" });

      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe(42);
      expect(parsed.name).toBe("my-project");
    });
  });
});
