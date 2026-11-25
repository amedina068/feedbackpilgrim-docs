---
title: Widget init
description: The call that the widget script makes from the browser with the publishable key, and the identity hash that your server makes for it.
order: 10
---

# Widget init

`POST /api/v1/init` starts the embeddable widget. The widget script `pilgrim.js` calls it from the browser. Read [The embeddable widget](../using-feedback-pilgrim/widget.md) for the setup.

This endpoint is not part of `/api/public/v1`. It does not accept an API token. It accepts the publishable key of the project only.

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/v1/init` | Finds or creates the contact and returns the iframe URLs of the widget. |

## The publishable key

The publishable key has the form `pk_` and 32 letters and digits. Find it in **Settings > Embed Widget**. The key is public. It identifies the project, but it gives no access to the REST API.

The widget sends the key in the `Authorization` header:

```text
Authorization: Bearer pk_<32 letters and digits>
```

## The identity hash

The identity hash (`user_hash`) proves the email of the signed-in user. Your server makes it with the identity secret of the project:

1. Trim the email of the user.
2. Change the email to lowercase.
3. Make the HMAC-SHA256 hex digest of the email, with the identity secret as the key.
4. Send the digest to the browser as `userHash`.

```php
$userHash = hash_hmac('sha256', strtolower(trim($user->email)), config('services.feedback_pilgrim.identity_secret'));
```

WARNING: Make the hash on your server only. Never put the identity secret in HTML or in browser JavaScript. With the secret, a person can sign in as any contact.

## Request

```http
POST /api/v1/init
```

| Field | Type | Required | Description |
|---|---|---|---|
| `contact` | object | Yes | The signed-in user of your app. |
| `contact.email` | string | Yes | The email of the user. You can also send the contact one level down, in `contact.contact`. |
| `contact.name`, `contact.mrr`, `contact.ltv`, `contact.avatar` | | No | The same fields as in [Init](init.md#request). Other fields are custom attributes. |
| `user_hash` | string | No | The identity hash. The project can require it. |
| `releaseNotes.show` | boolean | No | If `true`, the response has the URL of the release notes iframe. |
| `releaseNotes.open` | boolean | No | If `true`, the widget opens the release notes when the contact has not seen the newest note. |
| `testimonials` | boolean or object | No | `true` adds the URL of the testimonials iframe. The widget script sends `true`. Any object that is not empty has the same effect. |

## Example request

On Feedback Pilgrim Cloud, the endpoint is `https://app.feedbackpilgrim.com/api/v1/init`. This example uses a self-hosted instance:

```bash
curl -X POST https://feedback.example.com/api/v1/init \
  -H 'Authorization: Bearer pk_<publishable-key>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"contact":{"email":"jane@example.com","name":"Jane Doe"},"user_hash":"<hash-from-your-server>","releaseNotes":{"show":true,"open":true},"testimonials":{"show":true}}'
```

## Example response

`200`:

```json
{
  "auth_url": "https://acme.feedback.example.com/authenticate/550e8400-e29b-41d4-a716-446655440000?expires=1767225600&signature=...",
  "releaseNotes": {
    "url": "https://acme.feedback.example.com/iframe/release-notes",
    "show": true,
    "open": false
  },
  "testimonials": {
    "url": "https://acme.feedback.example.com/iframe/testimonials?contact_token=..."
  }
}
```

| Field | Description |
|---|---|
| `auth_url` | The sign-in link of the contact, valid for 24 hours. Without a verified contact, or for an admin contact, it is the URL of the public board (`/posts`). |
| `releaseNotes` | The release notes iframe. `[]` when the request has no `releaseNotes`. |
| `testimonials` | The testimonials iframe. For a known contact, the URL has a contact token that is valid for 24 hours. `[]` when the request has no `testimonials`. |

## Errors

| Status | Body | Cause |
|---|---|---|
| `401` | `{"error": "Invalid client key"}` | The key is missing or wrong, or every user of the project is deactivated. |
| `403` | `{"error": "Identity verification failed"}` | The `user_hash` is wrong, or it is missing and the project requires identity verification. |
| `422` | `{"message": "...", "errors": {...}}` | The request has no contact email. |
| `429` | `{"message": "Too Many Attempts."}` | The IP address made more than 120 requests in one minute. |

Without a `user_hash`, the endpoint can create a new contact. It does not update or sign in an existing contact.

## Server SDKs

A server SDK does not call this endpoint, because the browser calls it. A server SDK makes the identity hash only. Read [SDKs](../sdks/overview.md).
