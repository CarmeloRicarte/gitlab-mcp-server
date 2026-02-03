import { describe, expect, it, mock, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerIssueTools } from "../../src/tools/issues.ts";
import { createMockClient, mockIssue } from "../setup.ts";

describe("Issue Tools", () => {
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

  describe("create_issue", () => {
    it("should register create_issue tool", () => {
      const client = createMockClient();
      registerIssueTools(server, client);

      expect(registeredTools.has("create_issue")).toBe(true);
    });

    it("should call client.post with issue data", async () => {
      const postMock = mock(() => Promise.resolve(mockIssue()));
      const client = createMockClient({ post: postMock });
      registerIssueTools(server, client);

      const tool = registeredTools.get("create_issue")!;
      await tool.handler({
        project: "group/project",
        title: "Bug report",
        description: "Something is broken",
        labels: "bug,urgent",
      });

      expect(postMock).toHaveBeenCalledWith(
        "/projects/group%2Fproject/issues",
        {
          title: "Bug report",
          description: "Something is broken",
          labels: "bug,urgent",
        }
      );
    });

    it("should return issue creation message with URL", async () => {
      const issue = mockIssue({
        iid: 42,
        web_url: "https://gitlab.com/group/project/-/issues/42",
      });
      const client = createMockClient({
        post: mock(() => Promise.resolve(issue)),
      });
      registerIssueTools(server, client);

      const tool = registeredTools.get("create_issue")!;
      const result = await tool.handler({
        project: "1",
        title: "Test",
      });

      expect(result.content[0].text).toContain("#42");
      expect(result.content[0].text).toContain("https://gitlab.com");
    });

    it("should include assignee_ids when provided", async () => {
      const postMock = mock(() => Promise.resolve(mockIssue()));
      const client = createMockClient({ post: postMock });
      registerIssueTools(server, client);

      const tool = registeredTools.get("create_issue")!;
      await tool.handler({
        project: "1",
        title: "Test",
        assignee_ids: [1, 2, 3],
      });

      expect(postMock).toHaveBeenCalledWith("/projects/1/issues", {
        title: "Test",
        assignee_ids: [1, 2, 3],
      });
    });
  });

  describe("list_issues", () => {
    it("should register list_issues tool", () => {
      const client = createMockClient();
      registerIssueTools(server, client);

      expect(registeredTools.has("list_issues")).toBe(true);
    });

    it("should call client.get with state filter", async () => {
      const getMock = mock(() => Promise.resolve([mockIssue()]));
      const client = createMockClient({ get: getMock });
      registerIssueTools(server, client);

      const tool = registeredTools.get("list_issues")!;
      await tool.handler({
        project: "1",
        state: "closed",
        per_page: 10,
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/1/issues?state=closed&per_page=10"
      );
    });

    it("should include search param when provided", async () => {
      const getMock = mock(() => Promise.resolve([mockIssue()]));
      const client = createMockClient({ get: getMock });
      registerIssueTools(server, client);

      const tool = registeredTools.get("list_issues")!;
      await tool.handler({
        project: "1",
        state: "opened",
        search: "login",
        per_page: 20,
      });

      expect(getMock).toHaveBeenCalledWith(
        "/projects/1/issues?state=opened&per_page=20&search=login"
      );
    });

    it("should return formatted issue list", async () => {
      const issues = [
        mockIssue({ iid: 1, title: "First issue" }),
        mockIssue({ iid: 2, title: "Second issue" }),
      ];
      const client = createMockClient({
        get: mock(() => Promise.resolve(issues)),
      });
      registerIssueTools(server, client);

      const tool = registeredTools.get("list_issues")!;
      const result = await tool.handler({
        project: "1",
        state: "opened",
        per_page: 20,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].iid).toBe(1);
      expect(parsed[1].title).toBe("Second issue");
    });
  });
});
