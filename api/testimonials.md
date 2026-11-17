---
title: Testimonials
description: List, read, create, update and approve the testimonials of a project through the REST API.
order: 7
---

# Testimonials

A testimonial is a text from a customer, with an optional rating. Read [Testimonials](../using-feedback-pilgrim/testimonials.md) for the concepts.

| Method | Path | What it does |
|---|---|---|
| `GET` | `/testimonials` | Lists the testimonials. |
| `POST` | `/testimonials` | Creates a testimonial. |
| `GET` | `/testimonials/{id}` | Returns one testimonial. |
| `PUT`, `PATCH` | `/testimonials/{id}` | Updates or approves a testimonial. |
| `DELETE` | `/testimonials/{id}` | Not supported. Returns `405`. |

## The testimonial object

```json
{
  "id": 3,
  "client_id": 1,
  "contact_id": 7,
  "title": null,
  "description": "This tool changed how we plan.",
  "rating": 5,
  "avatar_image": null,
  "username": "Jane Doe",
  "subtitle": null,
  "approved_at": null,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "contact": {"id": 7, "name": "Jane Doe", "email": "jane@example.com"},
  "votes": [],
  "comments": []
}
```

| Field | Description |
|---|---|
| `username` | The name that the public site shows. |
| `rating` | 1 to 5, or `null`. |
| `approved_at` | The approval date. If `null`, the testimonial is pending, and the public site does not show it. |

The list and one testimonial add `contact`, `votes` and `comments`. Create and update return `contact`.

## List testimonials

```http
GET /testimonials
```

| Parameter | In | Description |
|---|---|---|
| `page`, `per_page` | query | Pagination. Read [API overview](overview.md#lists-and-pagination). |
| `approved` | query | Send `approved=1` for the approved testimonials. Without `approved`, the list holds the pending testimonials only. |
| `search` | query | Finds the text in `description` or `username`. |
| `rating` | query | Only the testimonials with this rating. |
| `sort_by` | query | `created_at`, `updated_at`, `rating` or `approved_at`. Without `sort_by`, the list has no fixed order. |
| `sort_direction` | query | `desc` (default) or `asc`. |

The app reads `approved` as a filled or empty value, not as a boolean. `approved=0` gives the pending testimonials. `approved=false` is a filled value, so it gives the approved testimonials. A list cannot hold the pending and the approved testimonials together.

## Get a testimonial

```http
GET /testimonials/{id}
```

Returns the testimonial with `contact`, `votes` and `comments`.

## Create a testimonial

```http
POST /testimonials
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `description` | string | Yes | |
| `username` | string | Yes | Maximum 255 characters |
| `rating` | integer | No | 1 to 5 |
| `contact_id` | integer | No | A contact of the project |

`201` returns the testimonial. A new testimonial is pending. The API does not read the rating setting of the project.

## Update or approve a testimonial

```http
PATCH /testimonials/{id}
```

| Field | Type | Rules |
|---|---|---|
| `description` | string | |
| `username` | string | Maximum 255 characters |
| `rating` | integer | 1 to 5 |
| `approved_at` | string | A date, for example `2026-11-17T09:00:00Z` |

To approve a testimonial, set `approved_at`. The API cannot remove an approval. Use the dashboard for that.

`200` returns the testimonial.

## Examples

```bash
curl 'https://feedback.example.com/api/public/v1/testimonials?approved=1&sort_by=approved_at' \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'

curl -X PATCH https://feedback.example.com/api/public/v1/testimonials/3 \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"approved_at":"2026-11-17T09:00:00Z"}'
```

Show the approved five-star testimonials on your marketing site, in PHP:

```php
use Illuminate\Support\Facades\Http;

$testimonials = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->get('https://feedback.example.com/api/public/v1/testimonials', [
        'approved' => 1,
        'rating' => 5,
        'sort_by' => 'approved_at',
    ])
    ->throw()
    ->json('data');
```

Call the API from your server and cache the result. Do not call it from the browser, because the token is secret.
