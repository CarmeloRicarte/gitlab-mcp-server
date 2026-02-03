import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import {
  GitLabClient,
  GitLabApiError,
  encodeProjectPath,
} from "../../src/client/gitlab-client.ts";

describe("GitLabClient", () => {
  const originalFetch = globalThis.fetch;
  let mockFetch: ReturnType<typeof mock>;

  beforeEach(() => {
    mockFetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("constructor", () => {
    it("should create client with config", () => {
      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });
      expect(client).toBeInstanceOf(GitLabClient);
    });
  });

  describe("request", () => {
    it("should make request with correct headers", async () => {
      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      await client.request("/projects");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gitlab.com/api/v4/projects",
        expect.objectContaining({
          headers: expect.objectContaining({
            "PRIVATE-TOKEN": "test-token",
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should return parsed JSON on success", async () => {
      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      const result = await client.request<{ id: number }>("/projects/1");

      expect(result).toEqual({ id: 1 });
    });

    it("should throw GitLabApiError on non-ok response", async () => {
      mockFetch = mock(() =>
        Promise.resolve(
          new Response("Not found", {
            status: 404,
            statusText: "Not Found",
          })
        )
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      await expect(client.request("/projects/999")).rejects.toThrow(
        GitLabApiError
      );
    });

    it("should include endpoint and status in error", async () => {
      mockFetch = mock(() =>
        Promise.resolve(
          new Response("Forbidden", {
            status: 403,
          })
        )
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      try {
        await client.request("/projects/1");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(GitLabApiError);
        const apiError = error as GitLabApiError;
        expect(apiError.status).toBe(403);
        expect(apiError.endpoint).toBe("/projects/1");
        expect(apiError.body).toBe("Forbidden");
      }
    });
  });

  describe("get", () => {
    it("should make GET request", async () => {
      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      await client.get("/projects");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gitlab.com/api/v4/projects",
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });
  });

  describe("post", () => {
    it("should make POST request with body", async () => {
      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      await client.post("/projects", { name: "test" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gitlab.com/api/v4/projects",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        })
      );
    });
  });

  describe("put", () => {
    it("should make PUT request with body", async () => {
      const client = new GitLabClient({
        apiBase: "https://gitlab.com/api/v4",
        token: "test-token",
      });

      await client.put("/projects/1", { name: "updated" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gitlab.com/api/v4/projects/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "updated" }),
        })
      );
    });
  });
});

describe("encodeProjectPath", () => {
  it("should encode simple path", () => {
    expect(encodeProjectPath("group/project")).toBe("group%2Fproject");
  });

  it("should encode path with special characters", () => {
    expect(encodeProjectPath("group/sub-group/project")).toBe(
      "group%2Fsub-group%2Fproject"
    );
  });

  it("should handle numeric project ID", () => {
    expect(encodeProjectPath("123")).toBe("123");
  });
});
