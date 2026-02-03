# GitLab MCP Server

A Model Context Protocol (MCP) server for GitLab integration with Claude Code.

## Features

- **Projects**: List and get project details
- **Branches**: List and create branches
- **Issues**: Create and list issues
- **Merge Requests**: Create and list MRs
- **Files**: Read and write repository files
- **Search**: Search code in repositories

## Requirements

- [Bun](https://bun.sh/) >= 1.0
- GitLab Personal Access Token with `api` scope

## Installation

```bash
bun install
```

## Configuration

Set the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITLAB_TOKEN` | Yes | - | GitLab Personal Access Token |
| `GITLAB_HOST` | No | `https://gitlab.com` | GitLab instance URL |

For self-hosted GitLab with self-signed certificates:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Usage with Claude Code

There are two ways to configure environment variables:

### Option A: Variables in MCP Config (Simplest)

Pass all variables directly in the MCP configuration. This is the easiest setup for new machines:

```bash
claude mcp add-json GitLab '{
  "type": "stdio",
  "command": "bun",
  "args": ["run", "/path/to/gitlab-mcp-server/index.ts"],
  "env": {
    "GITLAB_HOST": "https://your-gitlab.com",
    "GITLAB_TOKEN": "glpat-your-token-here",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  }
}'
```

> ⚠️ **Note**: The token is stored in `~/.claude.json` (local, private file). This is acceptable for personal use.

### Option B: System Variables + MCP Config (More Secure)

Keep sensitive tokens in system environment variables and only pass non-sensitive values in the MCP config:

1. Set the token at system/user level:

   **Windows (PowerShell):**
   ```powershell
   [Environment]::SetEnvironmentVariable("GITLAB_TOKEN", "glpat-xxx", "User")
   ```

   **macOS/Linux:**
   ```bash
   echo 'export GITLAB_TOKEN="glpat-xxx"' >> ~/.zshrc  # or ~/.bashrc
   source ~/.zshrc
   ```

2. Add the MCP with only non-sensitive variables:

   ```bash
   claude mcp add-json GitLab '{
     "type": "stdio",
     "command": "bun",
     "args": ["run", "/path/to/gitlab-mcp-server/index.ts"],
     "env": {
       "GITLAB_HOST": "https://your-gitlab.com",
       "NODE_TLS_REJECT_UNAUTHORIZED": "0"
     }
   }'
   ```

> ⚠️ **Important**: `${VARIABLE}` syntax does NOT work in Claude Code MCP config - it will be treated as a literal string, not resolved.

### Verify Installation

Restart Claude Code and verify the connection:

```bash
claude mcp list
```

You should see:
```
GitLab: bun run /path/to/gitlab-mcp-server/index.ts - ✓ Connected
```

## Available Tools

### Projects
- `list_projects` - List accessible GitLab projects
- `get_project` - Get details of a specific project

### Branches
- `list_branches` - List branches in a project
- `create_branch` - Create a new branch

### Issues
- `create_issue` - Create a new issue
- `list_issues` - List issues in a project

### Merge Requests
- `create_merge_request` - Create a merge request
- `list_merge_requests` - List merge requests

### Files
- `get_file` - Get file contents from repository
- `create_or_update_file` - Create or update a file

### Search
- `search_code` - Search for code in a project

## Development

### Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── config.ts             # Environment configuration
├── client/
│   └── gitlab-client.ts  # GitLab API client
├── tools/
│   ├── index.ts          # Tool registration
│   ├── projects.ts
│   ├── branches.ts
│   ├── issues.ts
│   ├── merge-requests.ts
│   ├── files.ts
│   └── search.ts
└── types/
    └── gitlab.ts         # TypeScript types
tests/
├── setup.ts              # Test utilities & mocks
├── client/
│   └── gitlab-client.test.ts
└── tools/
    └── *.test.ts
```

### Run Server

```bash
bun run start
# or with hot reload
bun run dev
```

### Run Tests

```bash
# Run all tests
bun test

# Run with watch mode
bun test:watch

# Run with coverage
bun test:coverage
```

### Type Check

```bash
bun run typecheck
```

## Architecture

The server uses dependency injection for the GitLab client, making it easy to mock in tests:

```typescript
import { GitLabClient } from "./src/client/gitlab-client";
import { createServer } from "./src/server";

// For testing with a mock client
const mockClient = new GitLabClient({
  apiBase: "https://mock.gitlab.com/api/v4",
  token: "test-token",
});
const server = createServer(mockClient);
```

## License

MIT
