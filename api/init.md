---
title: Init
description: Create or update a contact from your server and get a sign-in link to the public site.
order: 3
---

# Init

`POST /init` creates or updates a contact and returns a sign-in link for the public site. Call it from your server, for example to add a "Feedback" link to a page of your app.

This endpoint uses an API token. The widget uses a different endpoint, `/api/v1/init`, with the publishable key. Read [The embeddable widget](../using-feedback-pilgrim/widget.md).

| Method | Path | What it does |
|---|---|---|
| `POST` | `/init` | Creates or updates a contact, and returns `auth_url`. |

## Request

```http
POST /api/public/v1/init
```

| Field | Type | Required | Description |
|---|---|---|---|
| `contact` | object | No | The contact. It needs `email` to create or update a contact. |
| `contact.email` | string | With `contact` | The email of the contact. The app finds the contact by email in the project. |
| `contact.name` | string | No | The name. |
| `contact.mrr` | number | No | The monthly recurring revenue. |
| `contact.ltv` | number | No | The lifetime value. |
| `contact.avatar` | string | No | The URL of an avatar image. |
| `contact.<other>` | any | No | A custom attribute. The app ignores `top_customer`. |

You can also send the contact nested as `contact.contact`. The app reads the email from `contact.email` or `contact.contact.email`.

The endpoint does not check an identity hash. The API token proves that the request comes from your server.

## Response

`200` with the sign-in link, if the request had a contact email:

```json
{
  "auth_url": "https://acme.feedback.example.com/authenticate/9b1c...?expires=1763463600&signature=..."
}
```

`200` with `{}`, if the request had no contact email.

The link signs in the contact on the public site of the project. It stays valid for 24 hours. Make a new link for each page view. Do not store it.

Each call also counts a session for the contact, one a day at most.

## Examples

```bash
curl -X POST https://feedback.example.com/api/public/v1/init \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"contact":{"email":"jane@example.com","name":"Jane Doe","mrr":49,"plan":"pro"}}'
```

In PHP, redirect the signed-in user of your app to the public site:

```php
use Illuminate\Support\Facades\Http;

$authUrl = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->post('https://feedback.example.com/api/public/v1/init', [
        'contact' => [
            'email' => $user->email,
            'name' => $user->name,
            'mrr' => $user->monthly_revenue,
        ],
    ])
    ->throw()
    ->json('auth_url');

return redirect()->away($authUrl);
```
