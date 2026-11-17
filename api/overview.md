---
title: API overview
description: The base URL, the request format, pagination, errors and rate limits of the Feedback Pilgrim REST API.
order: 1
---

# API overview

The REST API reads and writes the data of one project: posts, release notes, contacts, testimonials and tags. Each request uses an API token, and the token decides the project. Read [Authentication](authentication.md).

The MCP server uses the same code and the same validation. Read [MCP server](../mcp/overview.md).

## Base URL

```text
https://feedback.example.com/api/public/v1
```

Use the dashboard host of your instance, that is the host of `APP_URL`.

## Endpoints

| Method | Path | Page |
|---|---|---|
| `POST` | `/init` | [Init](init.md) |
| `GET`, `POST` | `/posts` | [Posts](posts.md) |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/posts/{id}` | [Posts](posts.md) |
| `GET`, `POST` | `/release-notes` | [Release notes](release-notes.md) |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/release-notes/{id}` | [Release notes](release-notes.md) |
| `GET`, `POST` | `/contacts` | [Contacts](contacts.md) |
| `GET`, `PUT`, `PATCH` | `/contacts/{id}` | [Contacts](contacts.md) |
| `GET`, `POST` | `/testimonials` | [Testimonials](testimonials.md) |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/testimonials/{id}` | [Testimonials](testimonials.md) |
| `GET`, `POST` | `/tags` | [Tags](tags.md) |
| `PUT`, `PATCH`, `DELETE` | `/tags/{id}` | [Tags](tags.md) |

An update accepts `PUT` or `PATCH`. Both change only the fields that you send.

`DELETE` on a post, a release note or a testimonial always returns `405` with `{"message": "Method not allowed"}`. The only delete in the API is the delete of a tag.

## Request format

Send these headers with each request:

```http
Authorization: Bearer <your-token>
Accept: application/json
Content-Type: application/json
```

Send `Accept: application/json`. Without it, an error can come back as a redirect instead of JSON.

The app does not read a project ID from the request. It takes the project from the token. A record of another project returns `404`.

## Lists and pagination

Each list endpoint accepts these query parameters:

| Parameter | Default | Rules |
|---|---|---|
| `page` | `1` | A number below 1 counts as 1. |
| `per_page` | `15` | Maximum 100. A number below 1 counts as 15. |
| `search` | none | Finds the text in some fields. Each endpoint page lists the fields. |
| `sort_by` | Differs for each endpoint | One of the columns that the endpoint page lists. |
| `sort_direction` | `desc` (`asc` for tags) | `asc` or `desc`. Another value counts as the default. |

If `sort_by` is not in the list of the endpoint, the list has no fixed order. The tags list is different: it sorts by `title`.

A list returns the pagination object of Laravel:

```json
{
  "current_page": 1,
  "data": [],
  "first_page_url": "https://feedback.example.com/api/public/v1/posts?page=1",
  "from": 1,
  "last_page": 3,
  "last_page_url": "https://feedback.example.com/api/public/v1/posts?page=3",
  "links": [],
  "next_page_url": "https://feedback.example.com/api/public/v1/posts?page=2",
  "path": "https://feedback.example.com/api/public/v1/posts",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 42
}
```

The records are in `data`. To read all the pages, follow `next_page_url` until it is `null`.

## Errors

| Status | Body | Cause |
|---|---|---|
| `401` | `{"message": "Unauthenticated."}` | The token is missing, wrong or deleted, or its user is deactivated. |
| `401` | `{"error": "Invalid API token"}` | The token has no project, or its user is not a member of the project now. |
| `404` | `{"message": "..."}` | The record does not exist in the project of the token. |
| `405` | `{"message": "Method not allowed"}` | A delete that the API does not support. |
| `422` | `{"message": "...", "errors": {"field": ["..."]}}` | The request failed validation. |
| `429` | `{"message": "Too Many Attempts."}` | The rate limit stopped the request. |

A `422` body looks like this:

```json
{
  "message": "The title field is required.",
  "errors": {
    "title": ["The title field is required."]
  }
}
```

## Rate limit

The API allows 1000 requests a minute for each user. Without a user, the limit applies to each IP address. The MCP server has its own limit. Read [MCP server](../mcp/overview.md#rate-limit).

## Dates

The API returns dates as ISO 8601 strings in UTC, for example `2026-11-17T09:00:00.000000Z`.
