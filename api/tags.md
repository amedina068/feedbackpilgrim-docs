---
title: Tags
description: List, create, rename and delete the tags of a project through the REST API.
order: 8
---

# Tags

A tag is a label for posts, contacts and release notes. The title of a tag is unique in a project. Read [Tags](../using-feedback-pilgrim/tags.md) for the concepts.

| Method | Path | What it does |
|---|---|---|
| `GET` | `/tags` | Lists the tags. |
| `POST` | `/tags` | Creates a tag. |
| `PUT`, `PATCH` | `/tags/{id}` | Renames a tag. |
| `DELETE` | `/tags/{id}` | Deletes a tag. |

The API has no endpoint to get one tag.

## The tag object

```json
{
  "id": 3,
  "client_id": 1,
  "title": "ui",
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "posts_count": 12,
  "contacts_count": 4
}
```

Only the list has `posts_count` and `contacts_count`.

## List tags

```http
GET /tags
```

| Parameter | In | Description |
|---|---|---|
| `page`, `per_page` | query | Pagination. Read [API overview](overview.md#lists-and-pagination). |
| `search` | query | Finds the text in `title`. |
| `sort_by` | query | `title` (default), `created_at` or `updated_at`. Another value sorts by `title`. |
| `sort_direction` | query | `asc` (default) or `desc`. |

### Example request

```bash
curl 'https://feedback.example.com/api/public/v1/tags?search=ui' \
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
      "id": 3,
      "client_id": 1,
      "title": "ui",
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z",
      "posts_count": 12,
      "contacts_count": 4
    }
  ],
  "first_page_url": "https://feedback.example.com/api/public/v1/tags?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "https://feedback.example.com/api/public/v1/tags?page=1",
  "links": [],
  "next_page_url": null,
  "path": "https://feedback.example.com/api/public/v1/tags",
  "per_page": 15,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

## Create a tag

```http
POST /tags
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | Yes | Maximum 255 characters, unique in the project |

`201` returns the tag. `422` means that the title is missing, too long, or in use in the project.

### Example request

```bash
curl -X POST https://feedback.example.com/api/public/v1/tags \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"title":"ui"}'
```

### Example response

`201`:

```json
{
  "title": "ui",
  "client_id": 1,
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "created_at": "2026-11-17T09:00:00.000000Z",
  "id": 3
}
```

## Rename a tag

```http
PATCH /tags/{id}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | Yes | Maximum 255 characters, unique in the project |

`200` returns the tag.

### Example request

```bash
curl -X PATCH https://feedback.example.com/api/public/v1/tags/3 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"title":"interface"}'
```

### Example response

`200`:

```json
{
  "id": 3,
  "client_id": 1,
  "title": "interface",
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z"
}
```

## Delete a tag

```http
DELETE /tags/{id}
```

The app removes the tag from its posts, contacts and release notes, then deletes the tag. `204` returns no body.

CAUTION: Make sure that you delete the correct tag. You cannot undo a delete.

### Example request

```bash
curl -X DELETE https://feedback.example.com/api/public/v1/tags/3 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

### Example response

`204` with no body.

## PHP example

Find a tag or create it, then put it on a post, in PHP:

```php
use Illuminate\Support\Facades\Http;

$api = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->baseUrl('https://feedback.example.com/api/public/v1');

$tag = collect($api->get('/tags', ['search' => 'ui'])->throw()->json('data'))
    ->firstWhere('title', 'ui');

$tag ??= $api->post('/tags', ['title' => 'ui'])->throw()->json();

$api->patch('/posts/42', ['tags' => [$tag['id']]])->throw();
```

The `tags` field of a post replaces all its tags. To add a tag and keep the others, read the post first and send all the tag IDs.
