---
title: Posts
description: List, read, create and update the posts of a project through the REST API.
order: 4
---

# Posts

A post is one piece of feedback. Read [Posts, votes and comments](../using-feedback-pilgrim/posts-votes-and-comments.md) for the concepts.

| Method | Path | What it does |
|---|---|---|
| `GET` | `/posts` | Lists the posts. |
| `POST` | `/posts` | Creates a post. |
| `GET` | `/posts/{id}` | Returns one post. |
| `PUT`, `PATCH` | `/posts/{id}` | Updates a post. |
| `DELETE` | `/posts/{id}` | Not supported. Returns `405`. |

## The post object

```json
{
  "id": 42,
  "client_id": 1,
  "stage_id": 4,
  "board_id": 1,
  "contact_id": 7,
  "title": "Add dark mode",
  "content": "Users want a dark theme.",
  "notes": null,
  "status": "in_progress",
  "stage_position": null,
  "published_at": "2026-11-17T09:00:00.000000Z",
  "archived_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "contact": {"id": 7, "name": "Jane Doe", "email": "jane@example.com"},
  "tags": [{"id": 3, "client_id": 1, "title": "ui"}],
  "votes": [{"id": 90, "contact_id": 7}]
}
```

| Field | Description |
|---|---|
| `client_id` | The ID of the project. |
| `stage_id` | The stage of the post. |
| `status` | `pending`, `in_progress` or `completed`. The app derives it from the stage. Read [Stages and the roadmap](../using-feedback-pilgrim/stages-and-roadmap.md#stage-types-and-the-status-of-a-post). |
| `notes` | The private notes of the team. |
| `published_at` | The publication date. If `null`, the public site does not show the post. |
| `archived_at` | The archive date, or `null`. |
| `contact` | The author, or `null`. |

The list adds `contact`, `tags` and `votes` to each post. One post also has `comments`. Create and update return `tags` and `contact`. Create also returns `stage`.

A `contact` inside a post has the custom attributes as one JSON string in `metadata`.

## List posts

```http
GET /posts
```

| Parameter | In | Description |
|---|---|---|
| `page`, `per_page` | query | Pagination. Read [API overview](overview.md#lists-and-pagination). |
| `search` | query | Finds the text in `title` or `content`. |
| `status` | query | `pending`, `in_progress` or `completed`. |
| `board_id` | query | Only the posts of this board. |
| `tag` | query | Only the posts with a tag of this title. |
| `published` | query | `true` for published posts only, `false` for unpublished posts only. |
| `sort_by` | query | `created_at` (default), `updated_at`, `title`, `status` or `published_at`. |
| `sort_direction` | query | `desc` (default) or `asc`. |

### Example request

```bash
curl 'https://feedback.example.com/api/public/v1/posts?status=pending&per_page=50' \
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
      "id": 42,
      "client_id": 1,
      "stage_id": 1,
      "board_id": 1,
      "contact_id": 7,
      "title": "Add dark mode",
      "content": "Users want a dark theme.",
      "notes": null,
      "status": "pending",
      "stage_position": null,
      "published_at": "2026-11-17T09:00:00.000000Z",
      "archived_at": null,
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z",
      "contact": {
        "id": 7,
        "uuid": "4f6c2a5e-7d3b-4d1e-9c8a-2b1f0e9d8c7b",
        "user_id": null,
        "client_id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "metadata": "{\"plan\":\"pro\"}",
        "notes": null,
        "avatar": "https://feedback.example.com/storage/avatars/7/avatar.png",
        "mrr": 49,
        "ltv": 1200,
        "top_customer": 0,
        "created_at": "2026-11-17T09:00:00.000000Z",
        "updated_at": "2026-11-17T09:00:00.000000Z"
      },
      "tags": [
        {
          "id": 3,
          "client_id": 1,
          "title": "ui",
          "created_at": "2026-11-17T09:00:00.000000Z",
          "updated_at": "2026-11-17T09:00:00.000000Z"
        }
      ],
      "votes": [
        {
          "id": 90,
          "contact_id": 7,
          "votable_type": "App\\Models\\Post",
          "votable_id": 42,
          "created_at": "2026-11-17T09:00:00.000000Z",
          "updated_at": "2026-11-17T09:00:00.000000Z"
        }
      ]
    }
  ],
  "first_page_url": "https://feedback.example.com/api/public/v1/posts?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "https://feedback.example.com/api/public/v1/posts?page=1",
  "links": [],
  "next_page_url": null,
  "path": "https://feedback.example.com/api/public/v1/posts",
  "per_page": 15,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

## Get a post

```http
GET /posts/{id}
```

Returns the post with `contact`, `tags`, `votes` and `comments`. `404` means that the post is not in the project of the token.

### Example request

```bash
curl https://feedback.example.com/api/public/v1/posts/42 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

### Example response

`200`:

```json
{
  "id": 42,
  "client_id": 1,
  "stage_id": 4,
  "board_id": 1,
  "contact_id": 7,
  "title": "Add dark mode",
  "content": "Users want a dark theme.",
  "notes": null,
  "status": "in_progress",
  "stage_position": null,
  "published_at": "2026-11-17T09:00:00.000000Z",
  "archived_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "contact": {
    "id": 7,
    "uuid": "4f6c2a5e-7d3b-4d1e-9c8a-2b1f0e9d8c7b",
    "user_id": null,
    "client_id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "metadata": "{\"plan\":\"pro\"}",
    "notes": null,
    "avatar": "https://feedback.example.com/storage/avatars/7/avatar.png",
    "mrr": 49,
    "ltv": 1200,
    "top_customer": 0,
    "created_at": "2026-11-17T09:00:00.000000Z",
    "updated_at": "2026-11-17T09:00:00.000000Z"
  },
  "tags": [
    {
      "id": 3,
      "client_id": 1,
      "title": "ui",
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ],
  "votes": [
    {
      "id": 90,
      "contact_id": 7,
      "votable_type": "App\\Models\\Post",
      "votable_id": 42,
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ],
  "comments": [
    {
      "id": 5,
      "contact_id": 7,
      "commentable_id": 42,
      "commentable_type": "App\\Models\\Post",
      "content": "Yes, please.",
      "hidden_at": null,
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ]
}
```

## Create a post

```http
POST /posts
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | Yes | Maximum 255 characters |
| `content` | string | Yes | |
| `status` | string | No | `pending` (default), `in_progress` or `completed` |
| `board_id` | integer | No | A board of the project. Default: the first board. |
| `tags` | integer array | No | Tag IDs of the project |

`201` returns the new post.

A post from the API has no author and is not published. Publish it in the dashboard. The app sends the `post.created` webhook event and the Slack message.

CAUTION: Do not repeat a failed create request without a check. Each request creates a new post.

### Example request

```bash
curl -X POST https://feedback.example.com/api/public/v1/posts \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Add dark mode","content":"Users want a dark theme.","tags":[3]}'
```

### Example response

`201`:

```json
{
  "title": "Add dark mode",
  "content": "Users want a dark theme.",
  "status": "pending",
  "board_id": 1,
  "client_id": 1,
  "stage_id": 1,
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "created_at": "2026-11-17T09:00:00.000000Z",
  "id": 43,
  "stage": {
    "id": 1,
    "client_id": 1,
    "name": "Open",
    "position": 1,
    "created_at": "2026-11-17T09:00:00.000000Z",
    "updated_at": "2026-11-17T09:00:00.000000Z",
    "slug": "open",
    "color": "#94a3b8",
    "type": "open",
    "show_on_roadmap": false
  },
  "tags": [
    {
      "id": 3,
      "client_id": 1,
      "title": "ui",
      "created_at": "2026-11-17T09:00:00.000000Z",
      "updated_at": "2026-11-17T09:00:00.000000Z"
    }
  ],
  "contact": null
}
```

## Update a post

```http
PATCH /posts/{id}
```

Send only the fields to change.

| Field | Type | Rules |
|---|---|---|
| `title` | string | Maximum 255 characters |
| `content` | string | |
| `status` | string | `pending`, `in_progress` or `completed` |
| `board_id` | integer | A board of the project |
| `tags` | integer array | Tag IDs of the project. The list replaces all the tags of the post. |

`200` returns the post.

A new `status` moves the post to the first stage of the matching type. The app then sends the same emails, webhook events and Slack message as a stage change in the dashboard. Read [Stages and the roadmap](../using-feedback-pilgrim/stages-and-roadmap.md). If the status does not change, the app sends nothing.

### Example request

```bash
curl -X PATCH https://feedback.example.com/api/public/v1/posts/42 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"status":"in_progress"}'
```

### Example response

`200`:

```json
{
  "id": 42,
  "client_id": 1,
  "stage_id": 4,
  "board_id": 1,
  "contact_id": 7,
  "title": "Add dark mode",
  "content": "Users want a dark theme.",
  "notes": null,
  "status": "in_progress",
  "stage_position": null,
  "published_at": "2026-11-17T09:00:00.000000Z",
  "archived_at": null,
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
  "contact": {
    "id": 7,
    "uuid": "4f6c2a5e-7d3b-4d1e-9c8a-2b1f0e9d8c7b",
    "user_id": null,
    "client_id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "metadata": "{\"plan\":\"pro\"}",
    "notes": null,
    "avatar": "https://feedback.example.com/storage/avatars/7/avatar.png",
    "mrr": 49,
    "ltv": 1200,
    "top_customer": 0,
    "created_at": "2026-11-17T09:00:00.000000Z",
    "updated_at": "2026-11-17T09:00:00.000000Z"
  }
}
```

## Delete a post

```http
DELETE /posts/{id}
```

The API cannot delete a post.

### Example request

```bash
curl -X DELETE https://feedback.example.com/api/public/v1/posts/42 \
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

Create a post, then read all the pending posts, in PHP:

```php
use Illuminate\Support\Facades\Http;

$api = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->baseUrl('https://feedback.example.com/api/public/v1');

$post = $api->post('/posts', [
    'title' => 'Add dark mode',
    'content' => 'Users want a dark theme.',
])->throw()->json();

$pending = [];
$page = 1;

do {
    $response = $api->get('/posts', ['status' => 'pending', 'page' => $page, 'per_page' => 100])->throw();
    $pending = array_merge($pending, $response->json('data'));
    $page++;
} while ($response->json('next_page_url') !== null);
```
