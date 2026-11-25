---
title: Connect a client
description: Add the Feedback Pilgrim MCP server to Claude Code, Claude Desktop, Codex, Cursor and other MCP clients.
order: 2
---

# Connect a client

The **Settings > API Tokens** page of the dashboard shows a snippet for each client. Paste a token in the **Auth token** field of the page, and the snippets fill in the token.

Before you start:

1. Make an API token for the project. Read [Authentication](../api/authentication.md).
2. Copy the server URL from **Settings > API Tokens**. On Feedback Pilgrim Cloud, the URL is `https://app.feedbackpilgrim.com/mcp`. On a self-hosted instance, it is the `APP_URL` of the instance with `/mcp`, for example `https://feedback.example.com/mcp`.

The examples on this page use the Cloud URL. On a self-hosted instance, replace it with the server URL of your instance.

After you change the configuration of a client, restart the client.

## Claude Code

Run this command in your terminal:

```bash
claude mcp add --transport http feedback-pilgrim https://app.feedbackpilgrim.com/mcp \
  --header "Authorization: Bearer <your-token>"
```

## Claude Desktop

Add the server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "feedback-pilgrim": {
      "type": "http",
      "url": "https://app.feedbackpilgrim.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>"
      }
    }
  }
}
```

## Codex

Codex connects through `mcp-remote`. Add the server to `~/.codex/config.toml`:

```toml
[mcp_servers.feedback-pilgrim]
command = "npx"
args = ["-y", "mcp-remote", "https://app.feedbackpilgrim.com/mcp", "--header", "Authorization: Bearer <your-token>"]
```

## Cursor and other clients

Add the server to the `mcp.json` file of the client, for example `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "feedback-pilgrim": {
      "url": "https://app.feedbackpilgrim.com/mcp",
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
- If the client cannot reach the server, open `https://app.feedbackpilgrim.com/up` in a browser. On a self-hosted instance, open `https://feedback.example.com/up`. The page must load.

## More than one project

A token belongs to one project. To use two projects:

1. Make a token in each project.
2. Add the server one time for each token.
3. Give each server a different name, for example `feedback-pilgrim-acme` and `feedback-pilgrim-beta`.
