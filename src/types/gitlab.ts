// GitLab API response types

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  default_branch: string;
  description?: string;
  visibility?: string;
  created_at?: string;
  last_activity_at?: string;
}

export interface GitLabBranch {
  name: string;
  protected: boolean;
  commit?: {
    id: string;
    short_id: string;
    title: string;
    author_name: string;
    created_at: string;
  };
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description?: string;
  state: "opened" | "closed";
  web_url: string;
  labels: string[];
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    username: string;
    name: string;
  };
  assignees?: Array<{
    id: number;
    username: string;
    name: string;
  }>;
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description?: string;
  state: "opened" | "closed" | "merged";
  source_branch: string;
  target_branch: string;
  web_url: string;
  author?: {
    id: number;
    username: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GitLabFile {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
  ref: string;
  blob_id: string;
  commit_id: string;
}

export interface GitLabSearchResult {
  filename: string;
  path: string;
  ref: string;
  startline: number;
  data: string;
}

// Tool response types (simplified for MCP output)
export interface ProjectSummary {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  default_branch: string;
}

export interface BranchSummary {
  name: string;
  protected: boolean;
  commit_sha?: string;
  commit_message?: string;
}

export interface IssueSummary {
  iid: number;
  title: string;
  state: string;
  web_url: string;
  labels: string[];
  created_at: string;
}

export interface MergeRequestSummary {
  iid: number;
  title: string;
  state: string;
  source_branch: string;
  target_branch: string;
  web_url: string;
  author?: string;
}

export interface SearchResultSummary {
  filename: string;
  path: string;
  ref: string;
  startline: number;
  data: string;
}
