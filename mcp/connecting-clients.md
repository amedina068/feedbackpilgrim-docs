---
title: Connect a client
description: Add the Feedback Pilgrim MCP server to Claude Code, Claude Desktop, Codex, Cursor and other MCP clients.
order: 2
---

# Connect a client

The **Settings > API Tokens** page of the dashboard shows a snippet for each client. Paste a token in the **Auth token** field of the page, and the snippets fill in the token.

Before you start:

1. Make an API token for the project. Read [Authentication](../api/authentication.md).
2. Copy the server URL from **Settings > API Tokens**, for example `https://feedback.example.com/mcp`.

After you change the configuration of a client, restart the client.

On the server, `fp:mcp:connect` prints the configuration for each client. With `--token=new`, it also makes a token with the abilities `mcp:read` and `mcp:write`:

```bash
docker exec feedbackpilgrim php artisan fp:mcp:connect --client=claude --token=new
```

`--client` accepts `claude`, `codex`, `cursor` and `json`. The printed lines read the token from the `FP_TOKEN` environment variable, so the token is not in your shell history.

## The instance-admin server

A second MCP server operates the instance: status, doctor, users, projects, API tokens, the queue and a test email. It uses stdio over SSH and `docker exec`. It needs no token and no open port:

```bash
claude mcp add fp-admin -- ssh <host> docker exec -i feedbackpilgrim php artisan mcp:start fp-admin
```

A destructive tool returns a preview first, and changes data only after a second call with `confirm: true`. The server writes each call to the `mcp-admin` log. An HTTP route at `/mcp/admin` exists only when `MCP_ADMIN_ENABLED=true`. It accepts only short-lived owner tokens from `fp:token:create --admin`.

## Claude Code

Run these commands in your terminal:

```bash
export FP_TOKEN=<your-token>
claude mcp add --transport http feedback-pilgrim https://feedback.example.com/mcp \
  --header "Authorization: Bearer ${FP_TOKEN}"
```

## Claude Desktop

Add the server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "feedback-pilgrim": {
      "type": "http",
      "url": "https://feedback.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>"
      }
    }
  }
}
```

## Codex

Run these commands in your terminal:

```bash
export FP_TOKEN=<your-token>
codex mcp add feedback-pilgrim --url https://feedback.example.com/mcp --bearer-token-env-var FP_TOKEN
```

An older Codex without `--url` connects through `mcp-remote`. Add the server to `~/.codex/config.toml`:

```toml
[mcp_servers.feedback-pilgrim]
command = "npx"
args = ["-y", "mcp-remote", "https://feedback.example.com/mcp", "--header", "Authorization: Bearer <your-token>"]
```

## Cursor and other clients

Add the server to the `mcp.json` file of the client, for example `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "feedback-pilgrim": {
      "url": "https://feedback.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>"
      }
    }
  }
}
```

A client must send the token in the `Authorization` header. The server does not support OAuth.

## Test the connection

Ask the agent to list the tags of the project. The agent calls `list_tags`. If the answer is an error about authentication, read the next section.

## If the connection fails

- If the client gets `401`, make sure that the token is complete, with the part before the `|`.
- If the client gets `401` with a correct token, make sure that the user of the token is active. The user must also be a member of the project.
- If the client gets `429`, the client sent more than 60 requests in a minute.
- If the client cannot reach the server, open `https://feedback.example.com/up` in a browser. The page must load.

## More than one project

A token belongs to one project. To use two projects:

1. Make a token in each project.
2. Add the server one time for each token.
3. Give each server a different name, for example `feedback-pilgrim-acme` and `feedback-pilgrim-beta`.
