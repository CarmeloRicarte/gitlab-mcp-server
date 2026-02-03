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

> ⚠️ **Important**: `${VARIABLE}` syntax does NOT work in most MCP configs - values are treated as literal strings, not resolved. Use Option A (hardcoded values) or Option B (system variables that the server reads from `process.env`).

Replace paths according to your OS:
- **Windows**: `C:/path/to/gitlab-mcp-server/index.ts`
- **macOS/Linux**: `/Users/yourname/path/to/gitlab-mcp-server/index.ts`

---

### Claude Code CLI

<details>
<summary><strong>Option A: All variables in config</strong></summary>

```bash
claude mcp add-json GitLab '{
  "type": "stdio",
  "command": "bun",
  "args": ["run", "/path/to/gitlab-mcp-server/index.ts"],
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
  "command": "bun",
  "args": ["run", "/path/to/gitlab-mcp-server/index.ts"],
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
# Expected: GitLab: bun run ... - ✓ Connected
```

---

### VS Code (with MCP extension)

Edit `~/.vscode/mcp.json` or `.vscode/mcp.json` in your project:

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "servers": {
    "GitLab": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>macOS / Linux</strong></summary>

```json
{
  "servers": {
    "GitLab": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

---

### Cursor

Edit `~/.cursor/mcp.json`:

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

---

### Zed

Edit `~/.config/zed/settings.json` (macOS/Linux) or `%APPDATA%\Zed\settings.json` (Windows):

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "context_servers": {
    "GitLab": {
      "command": {
        "path": "bun",
        "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
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

</details>

<details>
<summary><strong>macOS / Linux</strong></summary>

```json
{
  "context_servers": {
    "GitLab": {
      "command": {
        "path": "bun",
        "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
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

</details>

---

### OpenCode

Edit `~/.config/opencode/config.json`:

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "mcp": {
    "servers": {
      "GitLab": {
        "type": "stdio",
        "command": "bun",
        "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
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

</details>

<details>
<summary><strong>macOS / Linux</strong></summary>

```json
{
  "mcp": {
    "servers": {
      "GitLab": {
        "type": "stdio",
        "command": "bun",
        "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
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

</details>

---

### Codex (OpenAI CLI)

Edit `~/.codex/config.json`:

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>macOS / Linux</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

---

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

---

### Claude Desktop

Edit the Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

<details>
<summary><strong>Windows</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "C:/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```json
{
  "mcpServers": {
    "GitLab": {
      "command": "bun",
      "args": ["run", "/Users/yourname/path/to/gitlab-mcp-server/index.ts"],
      "env": {
        "GITLAB_HOST": "https://your-gitlab.com",
        "GITLAB_TOKEN": "glpat-your-token",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

</details>

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
