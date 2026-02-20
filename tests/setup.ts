import { mock } from "bun:test";
import type { GitLabClient } from "../src/client/gitlab-client.ts";

// Mock client overrides type
interface MockOverrides {
  request?: ReturnType<typeof mock>;
  get?: ReturnType<typeof mock>;
  post?: ReturnType<typeof mock>;
  put?: ReturnType<typeof mock>;
}

// Mock GitLab client factory - returns GitLabClient type for test compatibility
export function createMockClient(overrides: MockOverrides = {}): GitLabClient {
  return {
    request: mock(() => Promise.resolve({})),
    get: mock(() => Promise.resolve({})),
    post: mock(() => Promise.resolve({})),
    put: mock(() => Promise.resolve({})),
    ...overrides,
  } as unknown as GitLabClient;
}

// Mock data factories
export const mockProject = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "test-project",
  path_with_namespace: "group/test-project",
  web_url: "https://gitlab.com/group/test-project",
  default_branch: "main",
  ...overrides,
});

export const mockBranch = (overrides: Record<string, unknown> = {}) => ({
  name: "feature-branch",
  protected: false,
  commit: {
    id: "abc123def456",
    short_id: "abc123d",
    title: "Initial commit",
    author_name: "Test User",
    created_at: "2024-01-01T00:00:00Z",
  },
  ...overrides,
});

export const mockIssue = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  iid: 1,
  title: "Test Issue",
  description: "Test description",
  state: "opened" as const,
  web_url: "https://gitlab.com/group/test-project/-/issues/1",
  labels: ["bug"],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

export const mockMergeRequest = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  iid: 1,
  title: "Test MR",
  description: "Test MR description",
  state: "opened" as const,
  source_branch: "feature-branch",
  target_branch: "main",
  web_url: "https://gitlab.com/group/test-project/-/merge_requests/1",
  author: {
    id: 1,
    username: "testuser",
    name: "Test User",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

export const mockFile = (overrides: Record<string, unknown> = {}) => ({
  file_name: "README.md",
  file_path: "README.md",
  size: 100,
  encoding: "base64",
  content: Buffer.from("# Test README").toString("base64"),
  ref: "main",
  blob_id: "abc123",
  commit_id: "def456",
  ...overrides,
});

export const mockUser = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  username: "testuser",
  name: "Test User",
  state: "active",
  avatar_url: "https://gitlab.com/uploads/-/system/user/avatar/1/avatar.png",
  web_url: "https://gitlab.com/testuser",
  ...overrides,
});

export const mockSearchResult = (overrides: Record<string, unknown> = {}) => ({
  filename: "index.ts",
  path: "src/index.ts",
  ref: "main",
  startline: 10,
  data: "export function test() {}",
  ...overrides,
});
