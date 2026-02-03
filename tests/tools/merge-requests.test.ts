import { describe, expect, it, mock, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMergeRequestTools } from "../../src/tools/merge-requests.ts";
import { createMockClient, mockMergeRequest } from "../setup.ts";

describe("Merge Request Tools", () => {
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

  describe("create_merge_request", () => {
    it("should register create_merge_request tool", () => {
      const client = createMockClient();
      registerMergeRequestTools(server, client);

      expect(registeredTools.has("create_merge_request")).toBe(true);
    });

    it("should call client.post with MR data", async () => {
      const postMock = mock(() => Promise.resolve(mockMergeRequest()));
      const client = createMockClient({ post: postMock });
      registerMergeRequestTools(server, client);

      const tool = registeredTools.get("create_merge_request")!;
      await tool.handler({
        project: "group/project",
        source_branch: "feature",
        target_branch: "main",
        title: "Add feature",
        description: "This adds a new feature",
        remove_source_branch: true,
      });

      expect(postMock).toHaveBeenCalledWith(
        "/projects/group%2Fproject/merge_requests",
        {
          source_branch: "feature",
          target_branch: "main",
          title: "Add feature",
          description: "This adds a new feature",
          remove_source_branch: true,
        }
      );
    });

    it("should return MR creation message with URL", async () => {
      const mr = mockMergeRequest({
        iid: 99,
        web_url: "https://gitlab.com/group/project/-/merge_requests/99",
      });
      const client = createMockClient({
        post: mock(() => Promise.resolve(mr)),
      });
      registerMergeRequestTools(server, client);

      const tool = registeredTools.get("create_merge_request")!;
      const result = await tool.handler({
        project: "1",
        source_branch: "feature",
        title: "Test MR",
      });

      expect(result.content[0].text).toContain("!99");
      expect(result.content[0].text).toContain("https://gitlab.com");
    });

    it("should use default values for optional params", async () => {
      const postMock = mock(() => Promise.resolve(mockMergeRequest()));
      const client = createMockClient({ post: postMock });
      registerMergeRequestTools(server, client);

      const tool = registeredTools.get("create_merge_request")!;
      await tool.handler({
        project: "1",
        source_branch: "feature",
        title: "Test",
      });

      expect(postMock).toHaveBeenCalledWith("/projects/1/merge_requests", {
        source_branch: "feature",
        target_branch: "main",
        title: "Test",
        remove_source_branch: true,
      });
    });
  });

  describe("list_merge_requests", () => {
    it("should register list_merge_requests tool", () => {
      const client = createMockClient();
      registerMergeRequestTools(server, client);

      expect(registeredTools.has("list_merge_requests")).toBe(true);
    });

    it("should call client.get with state filter", async () => {
      const getMock = mock(() => Promise.resolve([mockMergeRequest()]));
      const client = createMockClient({ get: getMock });
      registerMergeRequestTools(server, client);

      const tool = registeredTools.get("list_merge_requests")!;
      await tool.handler({
        project: "1",
        state: "merged",
        per_page: 50,
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/1/merge_requests?state=merged&per_page=50"
      );
    });

    it("should return formatted MR list", async () => {
      const mrs = [
        mockMergeRequest({ iid: 1, title: "First MR", state: "opened" }),
        mockMergeRequest({ iid: 2, title: "Second MR", state: "merged" }),
      ];
      const client = createMockClient({
        get: mock(() => Promise.resolve(mrs)),
      });
      registerMergeRequestTools(server, client);

      const tool = registeredTools.get("list_merge_requests")!;
      const result = await tool.handler({
        project: "1",
        state: "all",
        per_page: 20,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].iid).toBe(1);
      expect(parsed[0].state).toBe("opened");
      expect(parsed[1].state).toBe("merged");
    });
  });
});
