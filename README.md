# GitLab MCP Server

[![npm version](https://img.shields.io/npm/v/@carmeloricarte/gitlab-mcp-server.svg)](https://www.npmjs.com/package/@carmeloricarte/gitlab-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for GitLab integration with Claude Code and AI assistants.

## Features

- **Projects**: List and get project details
- **Branches**: List and create branches
- **Issues**: Create and list issues
- **Merge Requests**: Create and list MRs
- **Files**: Read and write repository files
- **Search**: Search code in repositories

## Requirements

- [Bun](https://bun.sh/) >= 1.0 **or** [Node.js](https://nodejs.org/) >= 18
- GitLab Personal Access Token with `api` scope

## Installation

The server is published on npm and can be run directly:

```bash
# Using Bun (recommended)
bunx @carmeloricarte/gitlab-mcp-server

# Using Node.js
npx @carmeloricarte/gitlab-mcp-server
```

No need to clone the repository or install dependencies manually.

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

## Environment Variables Setup

There are two approaches to configure credentials:

### Option A: Variables in MCP Config (Simplest)

Pass all variables directly in the MCP configuration. Easiest for quick setup on new machines.

> ⚠️ **Note**: Token is stored in the config file (local, private). Acceptable for personal use.

### Option B: System Environment Variables (More Secure)

Keep sensitive tokens at system/user level, only pass non-sensitive values in MCP config.

<details>
<summary><strong>Windows (PowerShell)</strong></summary>

```powershell
# Set permanently for current user
[Environment]::SetEnvironmentVariable("GITLAB_TOKEN", "glpat-your-token", "User")
[Environment]::SetEnvironmentVariable("GITLAB_HOST", "https://your-gitlab.com", "User")

# Verify
[Environment]::GetEnvironmentVariable("GITLAB_TOKEN", "User")
```

> Restart your terminal/IDE after setting variables.

</details>

<details>
<summary><strong>macOS / Linux</strong></summary>

```bash
# Add to ~/.zshrc (macOS) or ~/.bashrc (Linux)
echo 'export GITLAB_TOKEN="glpat-your-token"' >> ~/.zshrc
echo 'export GITLAB_HOST="https://your-gitlab.com"' >> ~/.zshrc

# Reload
source ~/.zshrc

# Verify
echo $GITLAB_TOKEN
```

</details>

---

## IDE / Tool Configuration

> 💡 **Tip**: Use `bunx` if you have Bun installed, or `npx` for Node.js. Both work identically.

> ⚠️ **Important**: `${VARIABLE}` syntax does NOT work in most MCP configs - values are treated as literal strings, not resolved. Use Option A (hardcoded values) or Option B (system variables that the server reads from `process.env`).

### ⚠️ Windows Configuration

On Windows, you must wrap `npx` or `bunx` commands with `cmd /c`. Use this format:

```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@carmeloricarte/gitlab-mcp-server"]
}
```

Or with Bun:

```json
{
  "command": "cmd",
  "args": ["/c", "bunx", "@carmeloricarte/gitlab-mcp-server"]
}
```

> **Important:** The package name must always be the **last argument** in the args array.

---

### Claude Code CLI

<details>
<summary><strong>Option A: All variables in config</strong></summary>

```bash
claude mcp add-json GitLab '{
  "type": "stdio",
  "command": "bunx",
  "args": ["@carmeloricarte/gitlab-mcp-server"],
  "env": {
    "GITLAB_HOST": "https://your-gitlab.com",
    "GITLAB_TOKEN": "glpat-your-token",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  }
}'
```

</details>

<details>
<summary><strong>Option B: Token from system env</strong></summary>

Set `GITLAB_TOKEN` as system variable (see above), then:

```bash
claude mcp add-json GitLab '{
  "type": "stdio",
  "command": "bunx",
  "args": ["@carmeloricarte/gitlab-mcp-server"],
  "env": {
    "GITLAB_HOST": "https://your-gitlab.com",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  }
}'
```

</details>

**Verify:**
```bash
claude mcp list
# Expected: GitLab: bunx ... - ✓ Connected
```

---

### VS Code (with MCP extension)

Edit `~/.vscode/mcp.json` or `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "GitLab": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@carmeloricarte/gitlab-mcp-server"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

---

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bunx",
      "args": ["@carmeloricarte/gitlab-mcp-server"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

---

### Zed

Edit `~/.config/zed/settings.json` (macOS/Linux) or `%APPDATA%\Zed\settings.json` (Windows):

```json
{
  "context_servers": {
    "GitLab": {
      "command": {
        "path": "bunx",
        "args": ["@carmeloricarte/gitlab-mcp-server"],
        "env": {
          "GITLAB_HOST": "https://your-gitlab.com",
          "GITLAB_TOKEN": "glpat-your-token",
          "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
      }
    }
  }
}
```

---

### OpenCode

Edit `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "servers": {
      "GitLab": {
        "type": "stdio",
        "command": "bunx",
        "args": ["@carmeloricarte/gitlab-mcp-server"],
        "env": {
          "GITLAB_HOST": "https://your-gitlab.com",
          "GITLAB_TOKEN": "glpat-your-token",
          "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
      }
    }
  }
}
```

---

### Codex (OpenAI CLI)

Edit `~/.codex/config.json`:

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bunx",
      "args": ["@carmeloricarte/gitlab-mcp-server"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

---

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bunx",
      "args": ["@carmeloricarte/gitlab-mcp-server"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

---

### Claude Desktop

Edit the Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bunx",
      "args": ["@carmeloricarte/gitlab-mcp-server"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
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

If you want to contribute or run the server locally for development:

### Clone and Install

```bash
git clone https://github.com/CarmeloRicarte/gitlab-mcp-server.git
cd gitlab-mcp-server
bun install
```

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
scripts/
└── add-shebang.js        # Adds Node shebang to compiled output
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

### Build

```bash
# Build for production (compiles to dist/index.js with Node.js compatibility)
bun run build

# Add shebang to compiled output (done automatically on publish)
bun run add-shebang
```

### Publish

Publishing to npm is automated via `prepublishOnly`:

```bash
npm version patch  # or minor/major
npm publish
```

This automatically:
1. Compiles TypeScript to JavaScript (`bun run build`)
2. Adds `#!/usr/bin/env node` shebang (`bun run add-shebang`)

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

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to:
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

## License

MIT
