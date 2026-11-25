---
title: Authentication
description: Make an API token for a project, send it as a bearer token, and delete it.
order: 2
---

# Authentication

The REST API and the MCP server accept an API token. An API token is a Laravel Sanctum personal access token. Each token belongs to one user and one project.

## Make a token

1. In the dashboard, choose the project in the project selector.
2. Open **Settings > API Tokens**.
3. Click **Generate token**.
4. Copy the token. The page shows it one time only.

The token belongs to the project that is active when you click the button. The token has all abilities (`*`) and no expiry date. The app gives each token the name `API Key`.

The token has the form `<id>|<random characters>`. Send the full value.

## Send the token

Send the token in the `Authorization` header. On Feedback Pilgrim Cloud:

```bash
curl https://app.feedbackpilgrim.com/api/public/v1/tags \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

On a self-hosted instance, use the host of your `APP_URL`:

```bash
curl https://feedback.example.com/api/public/v1/tags \
  -H 'Authorization: Bearer <your-token>' \
  -H 'Accept: application/json'
```

In PHP with the Laravel HTTP client, on a self-hosted instance. On Cloud, use `https://app.feedbackpilgrim.com/api/public/v1` as the base URL.

```php
use Illuminate\Support\Facades\Http;

$api = Http::withToken(config('services.feedback_pilgrim.token'))
    ->acceptJson()
    ->baseUrl('https://feedback.example.com/api/public/v1');

$tags = $api->get('/tags')->throw()->json('data');
```

Keep the token in the configuration of your server, for example in `.env`. The examples in these docs read it with `config('services.feedback_pilgrim.token')`.

WARNING: Never put an API token in HTML or in browser JavaScript. The token can read and change all the data of the project. For the browser, use the publishable key of the widget. Read [The embeddable widget](../using-feedback-pilgrim/widget.md).

## When a token stops working

A token works only while all these conditions are true:

- The token exists.
- The user of the token is not deactivated.
- The user of the token is still a member of the project of the token.

If the owner deactivates the user, the token returns `401`. If the owner reactivates the user, the token works again.

## Delete a token

1. Open **Settings > API Tokens**.
2. Find the token in **Active tokens**. Each row shows the date of creation and the last use.
3. Click **Delete**.

The page lists the tokens of the active project only.

## The MCP server

The MCP server at `/mcp` accepts the same token. Read [Connect a client](../mcp/connecting-clients.md).
