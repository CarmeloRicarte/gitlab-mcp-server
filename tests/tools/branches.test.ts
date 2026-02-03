import { describe, expect, it, mock, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBranchTools } from "../../src/tools/branches.ts";
import { createMockClient, mockBranch } from "../setup.ts";

describe("Branch Tools", () => {
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

  describe("list_branches", () => {
    it("should register list_branches tool", () => {
      const client = createMockClient();
      registerBranchTools(server, client);

      expect(registeredTools.has("list_branches")).toBe(true);
    });

    it("should call client.get with correct endpoint", async () => {
      const getMock = mock(() => Promise.resolve([mockBranch()]));
      const client = createMockClient({ get: getMock });
      registerBranchTools(server, client);

      const tool = registeredTools.get("list_branches")!;
      await tool.handler({ project: "group/project" });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/group%2Fproject/repository/branches?"
      );
    });

    it("should include search param when provided", async () => {
      const getMock = mock(() => Promise.resolve([mockBranch()]));
      const client = createMockClient({ get: getMock });
      registerBranchTools(server, client);

      const tool = registeredTools.get("list_branches")!;
      await tool.handler({ project: "1", search: "feature" });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/1/repository/branches?search=feature"
      );
    });

    it("should return formatted branch list", async () => {
      const branches = [
        mockBranch({ name: "main", protected: true }),
        mockBranch({ name: "develop", protected: false }),
      ];
      const client = createMockClient({
        get: mock(() => Promise.resolve(branches)),
      });
      registerBranchTools(server, client);

      const tool = registeredTools.get("list_branches")!;
      const result = await tool.handler({ project: "1" });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe("main");
      expect(parsed[0].protected).toBe(true);
    });
  });

  describe("create_branch", () => {
    it("should register create_branch tool", () => {
      const client = createMockClient();
      registerBranchTools(server, client);

      expect(registeredTools.has("create_branch")).toBe(true);
    });

    it("should call client.post with branch data", async () => {
      const postMock = mock(() =>
        Promise.resolve(mockBranch({ name: "new-feature" }))
      );
      const client = createMockClient({ post: postMock });
      registerBranchTools(server, client);

      const tool = registeredTools.get("create_branch")!;
      await tool.handler({
        project: "group/project",
        branch: "new-feature",
        ref: "main",
      });

      expect(postMock).toHaveBeenCalledWith(
        "/projects/group%2Fproject/repository/branches",
        { branch: "new-feature", ref: "main" }
      );
    });

    it("should return success message", async () => {
      const client = createMockClient({
        post: mock(() => Promise.resolve(mockBranch({ name: "feature-x" }))),
      });
      registerBranchTools(server, client);

      const tool = registeredTools.get("create_branch")!;
      const result = await tool.handler({
        project: "1",
        branch: "feature-x",
        ref: "develop",
      });

      expect(result.content[0].text).toContain("feature-x");
      expect(result.content[0].text).toContain("created successfully");
      expect(result.content[0].text).toContain("develop");
    });
  });
});
