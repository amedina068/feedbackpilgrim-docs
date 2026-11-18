---
title: Release notes
description: List, read, create and update the release notes of a project through the REST API.
order: 5
---

# Release notes

A release note is a changelog entry of a project. Read [Release notes](../using-feedback-pilgrim/release-notes.md) for the concepts.

| Method | Path | What it does |
|---|---|---|
| `GET` | `/release-notes` | Lists the release notes. |
| `POST` | `/release-notes` | Creates a release note. |
| `GET` | `/release-notes/{id}` | Returns one release note. |
| `PUT`, `PATCH` | `/release-notes/{id}` | Updates a release note. |
| `DELETE` | `/release-notes/{id}` | Not supported. Returns `405`. |

## The release note object

```json
{
  "id": 7,
  "client_id": 1,
  "user_id": 1,
  "title": "New dashboard",
  "content": "The dashboard has a new layout.",
  "slug": "new-dashboard-20261117",
  "status": "draft",
  "published_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "tags": [],
  "votes": [],
  "comments": []
}
```

| Field | Description |
|---|---|
| `user_id` | The user who wrote the note. For a note from the API, the user of the token. |
| `slug` | The path of the note on the public site: `/release-notes/<slug>`. |
| `status` | `draft` or `published`. |
| `published_at` | The publication date. The public site shows only notes with a publication date. |

The list and one note add `tags`, `votes` and `comments`. Create and update return `tags`.

## List release notes

```http
GET /release-notes
```

| Parameter | In | Description |
|---|---|---|
| `page`, `per_page` | query | Pagination. Read [API overview](overview.md#lists-and-pagination). |
| `search` | query | Finds the text in `title` or `content`. |
| `published` | query | `true` for notes with a publication date, `false` for notes without one. |
| `tag` | query | Only the notes with a tag of this title. |
| `sort_by` | query | `created_at` (default), `updated_at`, `title` or `published_at`. |
| `sort_direction` | query | `desc` (default) or `asc`. |

### Example request

```bash
curl 'https://feedback.example.com/api/public/v1/release-notes?published=false' \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

### Example response

`200`:

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 7,
      "client_id": 1,
      "user_id": 1,
      "title": "New dashboard",
      "content": "The dashboard has a new layout.",
      "slug": "new-dashboard-20261117",
      "status": "draft",
      "published_at": null,
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z",
      "tags": [
        {
          "id": 3,
          "client_id": 1,
          "title": "ui",
          "created_at": "2026-11-17T09:00:00.000000Z",
          "updated_at": "2026-11-17T09:00:00.000000Z"
        }
      ],
      "votes": [],
      "comments": []
    }
  ],
  "first_page_url": "https://feedback.example.com/api/public/v1/release-notes?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "https://feedback.example.com/api/public/v1/release-notes?page=1",
  "links": [],
  "next_page_url": null,
  "path": "https://feedback.example.com/api/public/v1/release-notes",
  "per_page": 15,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

## Get a release note

```http
GET /release-notes/{id}
```

Returns the note with `tags`, `votes` and `comments`.

### Example request

```bash
curl https://feedback.example.com/api/public/v1/release-notes/7 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

### Example response

`200`:

```json
{
  "id": 7,
  "client_id": 1,
  "user_id": 1,
  "title": "New dashboard",
  "content": "The dashboard has a new layout.",
  "slug": "new-dashboard-20261117",
  "status": "draft",
  "published_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "tags": [
    {
      "id": 3,
      "client_id": 1,
      "title": "ui",
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ],
  "votes": [],
  "comments": []
}
```

## Create a release note

```http
POST /release-notes
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | Yes | Maximum 255 characters |
| `content` | string | Yes | Markdown is allowed. |
| `tags` | integer array | No | Tag IDs of the project |

`201` returns the note. The note has the status `draft` and no publication date. The API cannot publish a note. Read [Release notes](../using-feedback-pilgrim/release-notes.md#release-notes-from-the-rest-api-or-the-mcp-server).

### Example request

```bash
curl -X POST https://feedback.example.com/api/public/v1/release-notes \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"title":"New dashboard","content":"The dashboard has a new layout.","tags":[3]}'
```

### Example response

`201`:

```json
{
  "id": 7,
  "client_id": 1,
  "user_id": 1,
  "title": "New dashboard",
  "content": "The dashboard has a new layout.",
  "slug": "new-dashboard-20261117",
  "status": "draft",
  "published_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "tags": [
    {
      "id": 3,
      "client_id": 1,
      "title": "ui",
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ]
}
```

## Update a release note

```http
PATCH /release-notes/{id}
```

| Field | Type | Rules |
|---|---|---|
| `title` | string | Maximum 255 characters |
| `content` | string | |
| `tags` | integer array | Tag IDs of the project. The list replaces all the tags of the note. |

`200` returns the note.

### Example request

```bash
curl -X PATCH https://feedback.example.com/api/public/v1/release-notes/7 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"title":"New dashboard layout"}'
```

### Example response

`200`:

```json
{
  "id": 7,
  "client_id": 1,
  "user_id": 1,
  "title": "New dashboard layout",
  "content": "The dashboard has a new layout.",
  "slug": "new-dashboard-20261117",
  "status": "draft",
  "published_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "tags": [
    {
      "id": 3,
      "client_id": 1,
      "title": "ui",
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ]
}
```

## Delete a release note

```http
DELETE /release-notes/{id}
```

The API cannot delete a release note.

### Example request

```bash
curl -X DELETE https://feedback.example.com/api/public/v1/release-notes/7 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

### Example response

`405`:

```json
{
  "message": "Method not allowed"
}
```

## PHP example

Create a draft from your deploy script, in PHP:

```php
use Illuminate\Support\Facades\Http;

$note = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->post('https://feedback.example.com/api/public/v1/release-notes', [
        'title' => 'Version 2.1',
        'content' => "## Changes\n\n- The dashboard has a new layout.",
    ])
    ->throw()
    ->json();
```
