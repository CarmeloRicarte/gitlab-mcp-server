import { describe, expect, it, mock, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerUserTools } from "../../src/tools/users.ts";
import { createMockClient, mockUser } from "../setup.ts";

describe("User Tools", () => {
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

	describe("search_users", () => {
		it("should register search_users tool", () => {
			const client = createMockClient();
			registerUserTools(server, client);

			expect(registeredTools.has("search_users")).toBe(true);
		});

		it("should call client.get with search query", async () => {
			const getMock = mock(() => Promise.resolve([mockUser()]));
			const client = createMockClient({ get: getMock });
			registerUserTools(server, client);

			const tool = registeredTools.get("search_users")!;
			await tool.handler({ search: "testuser", per_page: 20 });

			expect(getMock).toHaveBeenCalledWith(
				"/users?search=testuser&per_page=20",
			);
		});

		it("should return formatted user list with id and username", async () => {
			const users = [
				mockUser({ id: 1, username: "john.doe", name: "John Doe" }),
				mockUser({ id: 2, username: "jane.doe", name: "Jane Doe" }),
			];
			const client = createMockClient({
				get: mock(() => Promise.resolve(users)),
			});
			registerUserTools(server, client);

			const tool = registeredTools.get("search_users")!;
			const result = await tool.handler({ search: "doe", per_page: 20 });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed).toHaveLength(2);
			expect(parsed[0].id).toBe(1);
			expect(parsed[0].username).toBe("john.doe");
			expect(parsed[0].name).toBe("John Doe");
			expect(parsed[1].id).toBe(2);
			expect(parsed[1].username).toBe("jane.doe");
		});

		it("should not include avatar_url or web_url in summary", async () => {
			const client = createMockClient({
				get: mock(() => Promise.resolve([mockUser()])),
			});
			registerUserTools(server, client);

			const tool = registeredTools.get("search_users")!;
			const result = await tool.handler({ search: "test", per_page: 20 });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed[0].avatar_url).toBeUndefined();
			expect(parsed[0].web_url).toBeUndefined();
		});
	});
});
