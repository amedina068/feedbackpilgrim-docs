---
title: Contacts
description: List, read, create or update, and update the contacts of a project through the REST API.
order: 6
---

# Contacts

A contact is a customer of a project. Read [Contacts and revenue](../using-feedback-pilgrim/contacts.md) for the concepts.

| Method | Path | What it does |
|---|---|---|
| `GET` | `/contacts` | Lists the contacts. |
| `POST` | `/contacts` | Creates a contact, or updates the contact with the same email. |
| `GET` | `/contacts/{id}` | Returns one contact. |
| `PUT`, `PATCH` | `/contacts/{id}` | Updates a contact. |

The API cannot delete a contact.

## The contact object

```json
{
  "id": 7,
  "uuid": "4f6c2a5e-7d3b-4d1e-9c8a-2b1f0e9d8c7b",
  "user_id": null,
  "client_id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "notes": null,
  "avatar": "https://feedback.example.com/storage/avatars/7/avatar.png",
  "mrr": 49,
  "ltv": 1200,
  "top_customer": false,
  "created_at": "2026-11-17T09:00:00.000000Z",
  "updated_at": "2026-11-17T09:00:00.000000Z",
  "tags": [],
  "votes": [],
  "plan": "pro"
}
```

| Field | Description |
|---|---|
| `user_id` | The user of an admin contact, or `null` for a customer. |
| `avatar` | The avatar URL. If the contact has no avatar, the app makes an image with the initials. |
| `mrr`, `ltv` | The revenue of the customer. Read [Contacts and revenue](../using-feedback-pilgrim/contacts.md#revenue-weighting). |
| Custom attributes | Each custom attribute is a field of the object, for example `plan`. The object has no `metadata` field. |

The list and one contact add `tags` and `votes`. Create and update return `tags`.

## List contacts

```http
GET /contacts
```

| Parameter | In | Description |
|---|---|---|
| `page`, `per_page` | query | Pagination. Read [API overview](overview.md#lists-and-pagination). |
| `search` | query | Finds the text in `name` or `email`. |
| `tag` | query | Only the contacts with a tag of this title. |
| `sort_by` | query | `created_at` (default), `updated_at`, `name`, `email`, `mrr` or `ltv`. |
| `sort_direction` | query | `desc` (default) or `asc`. |

The list also holds the admin contacts of the users.

## Get a contact

```http
GET /contacts/{id}
```

Returns the contact with `tags` and `votes`.

## Create or update a contact

```http
POST /contacts
```

The app looks for a contact with the same email in the project. If it finds one, it updates that contact. If not, it creates a contact.

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | Yes | Maximum 255 characters |
| `email` | string | Yes | A valid email, maximum 255 characters |
| `avatar` | string | No | A URL |
| `mrr` | number | No | Default `0` for a new contact |
| `ltv` | number | No | Default `0` for a new contact |
| `tags` | integer array | No | Tag IDs of the project. The list replaces all the tags of the contact. |
| `metadata` | object | No | Custom attributes |
| Other fields | any | No | Each other field is a custom attribute. |

The custom attributes must obey these limits, or the request returns `422` with an error on `metadata`:

- No key starts with `pilgrim_`.
- 50 keys or fewer, nested keys included.
- 3 levels of nesting or fewer.
- 16 KB or less as JSON.

For an existing contact, the app merges the new custom attributes with the old ones.

| Status | Meaning |
|---|---|
| `201` | The app created a contact. |
| `200` | The app updated the contact with this email. |

## Update a contact

```http
PATCH /contacts/{id}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | Maximum 255 characters |
| `email` | string | A valid email, unique in the project |
| `avatar` | string | A URL |
| `mrr` | number | |
| `ltv` | number | |
| `tags` | integer array | Tag IDs of the project. The list replaces all the tags. |

This endpoint does not change the custom attributes. To change them, use `POST /contacts` with the email of the contact.

`200` returns the contact.

## Examples

```bash
curl 'https://feedback.example.com/api/public/v1/contacts?sort_by=mrr&sort_direction=desc' \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'

curl -X POST https://feedback.example.com/api/public/v1/contacts \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com","mrr":49,"ltv":1200,"plan":"pro"}'
```

Send the revenue of each customer from your billing code, in PHP:

```php
use Illuminate\Support\Facades\Http;

$response = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->post('https://feedback.example.com/api/public/v1/contacts', [
        'name' => $customer->name,
        'email' => $customer->email,
        'mrr' => $customer->monthly_revenue,
        'ltv' => $customer->lifetime_revenue,
        'plan' => $customer->plan,
    ])
    ->throw();

$created = $response->status() === 201;
```
