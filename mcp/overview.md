---
title: MCP server
description: Connect an AI agent to the data of a project through the Model Context Protocol server of Feedback Pilgrim.
order: 1
---

# MCP server

Each instance has a Model Context Protocol (MCP) server. An AI agent can use it to read and change the data of one project: posts, release notes, contacts, testimonials and tags.

The MCP server and the REST API use the same code and the same validation. Read [API overview](../api/overview.md).

## The endpoint

On Feedback Pilgrim Cloud, the endpoint is:

```text
https://app.feedbackpilgrim.com/mcp
```

On a self-hosted instance, the endpoint is on the dashboard host, that is the host of `APP_URL`:

```text
https://feedback.example.com/mcp
```

The **Settings > API Tokens** page of the dashboard shows the URL.

| Property | Value |
|---|---|
| Transport | Streamable HTTP |
| Server name | `Feedback Pilgrim` |
| Server version | `1.0.0` |
| Tools | 21. Read [MCP tools reference](tools-reference.md). |
| State | Stateless |

The **Settings > API Tokens** page shows the badge "20 tools". The server registers 21 tools.

## Authentication

The server accepts an API token as a bearer token only:

```http
Authorization: Bearer <your-token>
```

Make the token in **Settings > API Tokens**. Read [Authentication](../api/authentication.md).

- The token decides the project. A tool never takes a project ID.
- The server refuses a session cookie. A request without a valid token gets `401`.
- If the owner deactivates the user of the token, the token stops working.

## Rate limit

The server allows 60 requests a minute for each token. This limit is separate from the limit of the REST API.

## Responses

A list tool returns an object with `records` and `pagination`:

```json
{
  "records": [
    {"id": 42, "title": "Add dark mode", "status": "pending"}
  ],
  "pagination": {
    "page": 1,
    "per_page": 15,
    "total": 42,
    "has_more": true
  }
}
```

To get the next page, call the tool again with `page` plus one. Stop when `has_more` is `false`.

A get, create or update tool returns the record as JSON. The fields are the same as in the REST API.

## Errors

| Case | Result |
|---|---|
| The record is not in the project of the token | A tool error with the text `Resource not found.` |
| The arguments fail validation | A tool error with the validation messages |
| No token, a wrong token, or a deactivated user | HTTP `401` |
| More than 60 requests a minute | HTTP `429` |

## Write tools

These tools change data: `create_post`, `update_post`, `create_post_comment`, `create_release_note`, `update_release_note`, `create_contact`, `update_contact`, `create_testimonial`, `update_testimonial`, `create_tag`, `update_tag` and `delete_tag`.

CAUTION: Do not let an agent repeat a failed create call without a check. Each call of a create tool makes a new record. `create_contact` is the exception: it updates the contact with the same email.

`create_post_comment` sends an email to the author of the post. The comment comes from the admin contact of the user of the token.

## Next steps

- [Connect a client](connecting-clients.md)
- [MCP tools reference](tools-reference.md)
