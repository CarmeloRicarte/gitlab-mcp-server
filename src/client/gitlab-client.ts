import type { Config } from "../config.ts";

export interface GitLabClientConfig {
  apiBase: string;
  token: string;
}

export class GitLabClient {
  private readonly apiBase: string;
  private readonly token: string;

  constructor(config: GitLabClientConfig) {
    this.apiBase = config.apiBase;
    this.token = config.token;
  }

  static fromConfig(config: Config): GitLabClient {
    return new GitLabClient({
      apiBase: config.apiBase,
      token: config.gitlabToken,
    });
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBase}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "PRIVATE-TOKEN": this.token,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new GitLabApiError(response.status, error, endpoint);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}

export class GitLabApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly endpoint: string
  ) {
    super(`GitLab API error (${status}) on ${endpoint}: ${body}`);
    this.name = "GitLabApiError";
  }
}

export function encodeProjectPath(projectPath: string): string {
  return encodeURIComponent(projectPath);
}
