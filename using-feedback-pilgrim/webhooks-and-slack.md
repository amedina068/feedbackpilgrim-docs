---
title: Webhooks and Slack
description: Send signed events to your own server, and post messages to a Slack channel.
order: 12
---

# Webhooks and Slack

A project can send events to your own server with webhooks, and messages to a Slack channel. The queue worker sends both. Read [Queues and the scheduler](../self-hosting/queues-and-scheduler.md).

## Webhooks

Open **Settings > Webhooks**. A webhook has:

| Field | Rules |
|---|---|
| URL | Required. An `https` URL with 2048 characters or fewer. The host must resolve to a public IP address. The URL cannot contain a user name or a password. |
| Events | One or more of the events below. |
| Active | On or off. A paused webhook gets no events. |

The app makes a signing secret of 40 characters for each webhook. The settings page shows the secret.

### Events

| Event | When |
|---|---|
| `post.created` | The app creates a post, from any source: the public site, the dashboard, the REST API or the MCP server. |
| `post.status_changed` | A user moves a post to another stage in the dashboard. |
| `post.completed` | A user moves a post to a `complete` stage in the dashboard, and the post was not complete before. |

A move to a `complete` stage sends both `post.status_changed` and `post.completed`. A status change from the REST API or the MCP server sends the same events.

### The request

The app sends a `POST` request with a JSON body:

```json
{
  "event": "post.status_changed",
  "data": {
    "id": 42,
    "title": "Add dark mode",
    "content": "Users want a dark theme.",
    "status": "in_progress",
    "board_id": 1,
    "contact_id": 7,
    "stage": {
      "id": 4,
      "name": "In Progress",
      "type": "active"
    }
  }
}
```

The request has these headers:

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-FeedbackPilgrim-Event` | The event, for example `post.created` |
| `X-FeedbackPilgrim-Delivery` | The ID of the delivery, a UUID. Each retry of the same delivery sends the same ID. |
| `X-FeedbackPilgrim-Timestamp` | The Unix time of the try, in seconds. Each retry sends a new time. |
| `X-FeedbackPilgrim-Signature-V2` | The HMAC-SHA256 of `<timestamp>.<raw body>`, with the signing secret as the key, in hexadecimal |
| `X-FeedbackPilgrim-Signature` | Deprecated. The HMAC-SHA256 of the raw body only. The next release removes it. |

### Verify the signature

1. Join the value of `X-FeedbackPilgrim-Timestamp`, a `.` and the raw body.
2. Compute the HMAC-SHA256 of this string with your signing secret.
3. Compare the result with `X-FeedbackPilgrim-Signature-V2`. Use a comparison in constant time.
4. If the timestamp is more than 5 minutes from the current time, reject the request.
5. If you already handled the delivery ID, ignore the request.

In a Laravel app:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

Route::post('/feedback-pilgrim/webhook', function (Request $request) {
    $timestamp = (string) $request->header('X-FeedbackPilgrim-Timestamp');
    $expected = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), config('services.feedback_pilgrim.webhook_secret'));

    abort_unless(hash_equals($expected, (string) $request->header('X-FeedbackPilgrim-Signature-V2')), 401);
    abort_if(abs(time() - (int) $timestamp) > 300, 401);

    if (! Cache::add('feedback-pilgrim:'.$request->header('X-FeedbackPilgrim-Delivery'), true, now()->addDay())) {
        return response()->noContent();
    }

    $event = $request->input('event');
    $post = $request->input('data');

    // Handle the event.

    return response()->noContent();
});
```

Use the raw body. If you encode the parsed JSON again, the signature can be different.

The old `X-FeedbackPilgrim-Signature` header signs the body only, so it cannot stop a replayed request. If your receiver reads it, change the receiver to `X-FeedbackPilgrim-Signature-V2` before the next release.

### Retries and the delivery log

If your server answers with a `4xx` or `5xx` status, or if the connection fails, the app tries again. The app tries three times in total. It waits 10 seconds, then 60 seconds, between the tries.

The app logs each try: the event, the status code and the result. The app does not store the response body. The result is one of these values:

| Result | Meaning |
|---|---|
| `delivered` | Your server answered with a `2xx` status. |
| `http_error` | Your server answered with a `4xx` or `5xx` status. |
| `redirect_refused` | Your server answered with a redirect. The app does not follow redirects. |
| `connection_failed` | The app could not connect, or the request timed out. |
| `address_refused` | The host of the URL resolved to an address that is not public. The app did not send the request and does not try again. |

The settings page shows the five newest tries for each webhook.

## Slack

1. In Slack, create an incoming webhook for a channel. Copy its URL.
2. In the dashboard, open **Settings > Integrations**.
3. Paste the URL in the Slack field. The URL must start with `https://hooks.slack.com/`.
4. Save.

To stop the messages, clear the field and save.

The app posts these messages:

| When | Message |
|---|---|
| The app creates a post | `🆕 New feedback: *<title>*` and the link of the post |
| A post moves to another stage, from the dashboard, the REST API or the MCP server | `🔄 *<title>* moved to *<stage>*` and the link of the post |

If Slack answers with a `4xx` or `5xx` status, the app tries again. It tries three times in total.

The app makes the link with the host of the request that caused the message. A post from the public site gets a link on the public site. A stage change in the dashboard gets a link on the dashboard host.
