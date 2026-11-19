---
title: SDKs
description: Install and use the Feedback Pilgrim SDKs for JavaScript and TypeScript, PHP, Python and Ruby.
order: 1
---

# SDKs

Feedback Pilgrim has four server SDKs: JavaScript and TypeScript, PHP, Python and Ruby. Each SDK is a client for the REST API of one instance. Each SDK also makes the identity hash for the widget and verifies signed webhooks.

All four SDKs are version 0.1.0. The changelog of each SDK says "Unreleased".

- The GitHub repository of each SDK is private now. You need read access to the repository to install an SDK.
- No SDK is on a package registry yet. Install each SDK from git, as each section below shows.

TODO(owner): The SDKs are not released, and their repositories are private. When will you make the repositories public, and on which registries (npm, Packagist, PyPI, RubyGems) will you publish the SDKs?

## What the 4 SDKs share

### The client

- The client takes the URL of your instance (its `APP_URL`) and an API token. Each user runs an own instance, so the URL has no default. Read [Make a token](../api/authentication.md#make-a-token).
- The client sends the token as `Authorization: Bearer <token>`.
- The client sends `Accept: application/json` with each request. Without this header, Laravel sends an error as a redirect to `/login` or as an HTML page.
- The token belongs to one project. It has all abilities and does not expire. Keep the token on your server.
- The default timeout is 30 seconds. The default number of retries is 2.

### The resources

Each SDK has the same operations. The method names are different in each language.

| Operation | JavaScript | PHP | Python | Ruby |
|---|---|---|---|---|
| [Init](../api/init.md) (sign-in link) | `init()` | `signInUrl()` | `sign_in_url()` | `sign_in_url` |
| [Posts](../api/posts.md) | `list`, `get`, `create`, `update` | `list`, `all`, `find`, `create`, `update` | `list`, `iter`, `get`, `create`, `update` | `list`, `find`, `create`, `update` |
| [Release notes](../api/release-notes.md) | `list`, `get`, `create`, `update` | `list`, `all`, `find`, `create`, `update` | `list`, `iter`, `get`, `create`, `update` | `list`, `find`, `create`, `update` |
| [Contacts](../api/contacts.md) | `list`, `get`, `upsert`, `update` | `list`, `all`, `find`, `upsert`, `update` | `list`, `iter`, `get`, `upsert`, `update` | `list`, `find`, `upsert`, `update` |
| [Testimonials](../api/testimonials.md) | `list`, `get`, `create`, `update`, `approve` | `list`, `all`, `find`, `create`, `update`, `approve` | `list`, `iter`, `get`, `create`, `update`, `approve` | `list`, `find`, `create`, `update`, `approve` |
| [Tags](../api/tags.md) | `list`, `create`, `update`, `delete` | `list`, `all`, `create`, `update`, `delete` | `list`, `iter`, `create`, `update`, `delete` | `list`, `create`, `update`, `delete` |

- Each update sends `PATCH` with only the fields that you give.
- A `tags` list replaces all the tags of the record.
- The API always returns `405` for a delete of a post, a release note, a contact or a testimonial. Thus, the SDKs have no delete method for these records.
- `approve` sets `approved_at` to the current time, or to a time that you give.
- `upsert` creates a contact, or updates the contact of the project with the same email. It merges the custom fields. `update` does not change the custom fields.

### The identity hash

Each SDK has a function that makes the identity hash (`user_hash`) for the widget. The hash is the HMAC-SHA256 hex digest of the normalized email, with the identity secret of the project as the key.

The SDKs normalize the email exactly like the app, with PHP `strtolower(trim($email))`:

- They remove only space, `\t`, `\n`, `\r`, `\0` and `\x0B` at both ends.
- They change only the ASCII letters `A` to `Z` to lowercase. A letter such as `É` does not change.

The identity secret is in **Settings > Embed Widget**. It is not the API token.

WARNING: Make the hash on your server only. With the identity secret, a person can sign in as any contact.

### The widget init

The SDKs do not call `POST /api/v1/init`. The widget script `pilgrim.js` calls it from the browser with the publishable key. Your server makes only the identity hash. Read [Widget init](../api/widget.md).

1. Add `pilgrim.js` to your page. Read [Add the widget](../using-feedback-pilgrim/widget.md#add-the-widget).
2. On your server, make the hash with the identity hash function of your SDK.
3. Give the email and the hash to the page.
4. Call `pilgrim()` with `contact` and `userHash`:

   ```html
   <script>
     pilgrim({
       contact: { email: "jane@example.com", name: "Jane Doe" },
       userHash: "<hash-from-your-server>",
     })
   </script>
   ```

### Webhook verification

Each SDK verifies the `X-FeedbackPilgrim-Signature-V2` header. Read [Verify the signature](../using-feedback-pilgrim/webhooks-and-slack.md#verify-the-signature) for the algorithm.

- The SDK reads `X-FeedbackPilgrim-Signature-V2`, `X-FeedbackPilgrim-Timestamp` and `X-FeedbackPilgrim-Delivery`.
- The SDK computes the HMAC-SHA256 of `<timestamp>.<raw body>` and compares the digests in constant time.
- The SDK rejects a timestamp that is more than 300 seconds from the current time. The tolerance is a parameter.
- The verified event has the event type, the post data, the timestamp and the delivery ID.
- The SDK does not store delivery IDs. Each retry of a delivery sends the same ID. Store the IDs that you processed, and drop a repeated delivery.

Give the raw bytes of the body to the SDK. Do not parse the JSON and encode it again. The app escapes `/` as `\/` and each character that is not ASCII as `\uXXXX`. A new encoding gives other bytes, and the signature does not match.

The SDKs do not read the deprecated `X-FeedbackPilgrim-Signature` header. No SDK has a function that verifies it. If a delivery has only the old header, the verification fails. The tests of each SDK prove that a body-only signature does not pass as a V2 signature.

### Errors

Each SDK has one error class for each HTTP status. The class names are different in each language.

| Status | Cause |
|---|---|
| `401` | The token is missing or wrong, or the user is deactivated. |
| `403` | The token cannot do this action. The REST API does not send it today. The SDKs map it for a later version. |
| `404` | The project of the token has no record with this ID. |
| `405` | The API does not support this operation. |
| `422` | The server refused a field. The error has the messages for each field. |
| `429` | The user sent more than 120 requests in one minute. The error has the `Retry-After` value. |
| `5xx` | The server failed. |

Read [Errors](../api/overview.md#errors) for the error bodies.

### Retries

The SDKs retry a failed request 2 times by default.

- The wait doubles on each retry: about 0.5, 1, 2 and 4 seconds, and 8 seconds at most. Half of each wait is random (jitter).
- After a `429`, the SDK waits for the `Retry-After` time. If `Retry-After` is more than 60 seconds, the SDK does not retry. It gives the rate limit error.
- `GET`, `PATCH`, `DELETE` and the contact `upsert` are idempotent. The SDK retries them after a `429`, a `5xx`, a timeout or a connection error.
- A create and a sign-in request are not idempotent. A second copy can make a second record. The SDK retries them only after a `429`, or after a connection error before the server got the request.
- The SDK does not retry another `4xx` status.

The limit is 120 requests each minute for each user. All the tokens of one user share this limit. Read [Rate limit](../api/overview.md#rate-limit).

### Pagination

A list returns one page: the Laravel paginator with `data`, `current_page`, `last_page`, `per_page`, `total` and more. Each SDK also has a helper that reads all the pages. The helper reads the next page only when your loop needs it.

`per_page` is 1 to 100. The API default is 15. Read [Lists and pagination](../api/overview.md#lists-and-pagination).

### Where the SDKs differ

| Topic | JavaScript | PHP | Python | Ruby |
|---|---|---|---|---|
| Install from the git URL | Does not work. Build the package from a clone. | Works with `:dev-main` | Works | Works |
| Settings from environment variables | No | Laravel only | URL and token | URL, token and both secrets |
| Identity hash | Async function | Static method, or a client method | Function | Module method |
| `per_page` of the "read all" helper | The `per_page` that you give | 100 | 100 | The `per_page` of the first page |
| A missing `X-FeedbackPilgrim-Delivery` header | The verification fails (`delivery`) | `deliveryId` is `null` | `delivery_id` is `None` | `delivery_id` is `nil` |
| A timeout | `TimeoutError` | `ConnectionException` | `APITimeoutError` | `ConnectionError` |
| Init with no contact email (the API returns `[]`) | `{}` | `null` | Raises `FeedbackPilgrimError` | `nil` |
| Framework integration | Examples for Next.js and Express | Laravel service provider and facade | Examples for Django and FastAPI | Rails Railtie and generator |

## JavaScript and TypeScript

The package name is `feedbackpilgrim`. The repository is `amedina068/feedbackpilgrim-js`.

### Install

The README of the SDK gives `npm install feedbackpilgrim`. This command does not work yet, because the package is not on npm.

An install from the git URL also does not work. The repository does not have the built `dist` folder, and it has no `prepare` script. Thus, npm installs the package without code, and Node.js cannot find the module when you import it.

Build the package from a clone instead:

1. Clone the repository:

   ```sh
   git clone https://github.com/amedina068/feedbackpilgrim-js.git
   cd feedbackpilgrim-js
   ```

2. Build the package and make a tarball:

   ```sh
   npm ci
   npm run build
   npm pack
   ```

3. In your app, install the tarball:

   ```sh
   npm install ../feedbackpilgrim-js/feedbackpilgrim-0.1.0.tgz
   ```

### Requirements

| Runtime | Version | Test in CI |
|---|---|---|
| Node.js | 20, 22, 24 and later | Unit tests and a smoke test |
| Bun | 1.x | Smoke test |
| Deno | 2.x | Smoke test |
| Cloudflare Workers | Current | None. The SDK uses only Web APIs that Workers supply. |

The package has no runtime dependencies. It uses the global `fetch` and Web Crypto. It ships ESM and CommonJS, with types for both. The build tools need Node.js 22 or later.

### Quick start

```ts
import { FeedbackPilgrim } from "feedbackpilgrim";

const pilgrim = new FeedbackPilgrim({
	baseUrl: "https://feedback.example.com",
	token: process.env.FEEDBACKPILGRIM_TOKEN,
});

const post = await pilgrim.posts.create({
	title: "Add dark mode",
	content: "Please add a dark theme.",
});
```

### Configuration

| Option | Default | Description |
|---|---|---|
| `baseUrl` | (required) | The root URL of your instance, a `string` or a `URL`. It must use `http` or `https`. |
| `token` | (required) | An API token. |
| `timeout` | `30000` | The time limit for one attempt, in milliseconds. |
| `maxRetries` | `2` | The maximum number of retries after the first attempt. `0` stops retries. |
| `fetch` | The global `fetch` | A `fetch` function for a proxy, for logs or for tests. |

Each method also accepts `{ signal, timeout, maxRetries }` as its last argument. These values replace the client values for that call. An `AbortSignal` also stops a retry wait.

The request fields and the response fields keep the names of the API, for example `board_id` and `sort_by`. Each ID must be a positive integer. For another value, the SDK throws a `TypeError` before it sends a request.

### Pagination

Each `list()` returns a `PagePromise`:

- Use `await` to get one page.
- Use `for await` to get each item of each page.
- Use `.pages()` to get each page.
- Use `.toArray()` to get all items in one array. Use it only for short lists.

```ts
const first = await pilgrim.tags.list({ per_page: 100 });
console.log(first.total, first.last_page);

for await (const contact of pilgrim.contacts.list({ tag: "beta" })) {
	console.log(contact.email);
}
```

The SDK asks for the next page by its number, with the same filters. It does not follow `next_page_url`, because that URL uses the `APP_URL` of the instance, not `baseUrl`.

### Errors

Each error extends `FeedbackPilgrimError` and has a `code`.

| Class | `code` | Cause |
|---|---|---|
| `AuthenticationError` | `authentication_error` | `401` |
| `AuthorizationError` | `authorization_error` | `403` |
| `NotFoundError` | `not_found` | `404` |
| `MethodNotAllowedError` | `method_not_allowed` | `405` |
| `ValidationError` | `validation_error` | `422`. Read `errors` for the messages of each field. |
| `RateLimitError` | `rate_limit` | `429`. Read `retryAfter`, in seconds. |
| `ServerError` | `server_error` | `5xx` |
| `ApiError` | `api_error` | Another error status. Each class above extends `ApiError`. |
| `ConnectionError` | `connection_error` | The request did not get a response. |
| `TimeoutError` | `timeout` | One attempt took more time than `timeout`. |
| `WebhookVerificationError` | `webhook_verification_error` | `verifyWebhook()` refused a delivery. Read `reason`. |

Each `ApiError` has `status`, `body` and `headers`. Use `instanceof`, or use `isFeedbackPilgrimError()` and a `switch` on `code`. If you abort a call with your own `AbortSignal`, the SDK throws the reason of the signal.

### Retries

The SDK uses the rules in [Retries](#retries). It also waits for a `Retry-After` header on a `5xx` response. These calls are not idempotent: `init()`, `posts.create()`, `releaseNotes.create()`, `testimonials.create()` and `tags.create()`.

### Webhook verification

`verifyWebhook()` verifies a delivery and returns the event. `verifyWebhookSignature()` returns a boolean.

```ts
import { verifyWebhook } from "feedbackpilgrim";

const event = await verifyWebhook({
	body: rawBody, // a string, a Uint8Array or an ArrayBuffer
	headers: request.headers, // a Headers object or a plain object
	secret: process.env.FEEDBACKPILGRIM_WEBHOOK_SECRET,
	tolerance: 300, // seconds, the default
});

event.deliveryId; // the X-FeedbackPilgrim-Delivery UUID
event.timestamp; // the Unix time of the attempt, in seconds
event.event; // "post.status_changed"
event.data; // { id, title, content, status, board_id, contact_id, stage }
```

If the check fails, `verifyWebhook()` throws a `WebhookVerificationError`. Its `reason` is `signature`, `timestamp` or `delivery`. Answer with a `400` status, and do not process the body.

`verifyWebhookSignature()` takes `body`, `signature`, `timestamp`, `secret` and `tolerance`. Give it the values of the headers.

In Express, use `express.raw()` on the webhook route. `express.json()` parses the body, and then the raw bytes are lost.

```ts
import express from "express";
import { verifyWebhook, WebhookVerificationError } from "feedbackpilgrim";

const app = express();

app.post(
	"/webhooks/feedbackpilgrim",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		try {
			const event = await verifyWebhook({
				body: req.body, // a Buffer
				headers: req.headers,
				secret: process.env.FEEDBACKPILGRIM_WEBHOOK_SECRET!,
			});
			console.log(event.deliveryId, event.event, event.data.title);
			res.sendStatus(204);
		} catch (error) {
			if (error instanceof WebhookVerificationError) {
				res.status(400).send(error.message);
				return;
			}
			throw error;
		}
	},
);
```

In a Next.js Route Handler, get the raw body with `await request.text()`. The README of the SDK has a full Next.js example.

### Identity hash

`identityHash()` returns a `Promise`, because it uses Web Crypto.

```ts
import { identityHash } from "feedbackpilgrim";

const userHash = await identityHash(
	user.email,
	process.env.FEEDBACKPILGRIM_IDENTITY_SECRET,
);
```

`normalizeEmail()` gives the email that the hash uses:

```ts
import { normalizeEmail } from "feedbackpilgrim";

normalizeEmail("  JOSÉ@Example.com "); // "josÉ@example.com"
```

### Sign-in link

`init()` sends `POST /api/public/v1/init`. It returns `{ auth_url }`. If the API returns `[]`, `init()` returns `{}`, and `auth_url` is `undefined`.

```ts
const { auth_url } = await pilgrim.init({
	email: "jane@example.com",
	name: "Jane Doe",
	plan: "premium", // a custom field
});
```

## PHP

The Composer package name is `feedbackpilgrim/feedbackpilgrim-php`. The repository is `amedina068/feedbackpilgrim-php`. The package has a Laravel integration.

### Install

1. Add the GitHub repository to the `repositories` key of your `composer.json`:

   ```json
   {
       "repositories": [
           { "type": "vcs", "url": "https://github.com/amedina068/feedbackpilgrim-php" }
       ]
   }
   ```

2. Require the package and Guzzle:

   ```bash
   composer require feedbackpilgrim/feedbackpilgrim-php:dev-main guzzlehttp/guzzle
   ```

The README of the SDK gives the command without `:dev-main`. The repository has no version tag yet, so Composer stops with this error: `Could not find a version of package feedbackpilgrim/feedbackpilgrim-php matching your minimum-stability (stable)`.

Composer needs a GitHub token to read the private repository. If Composer cannot read it, add a token: `composer config --global github-oauth.github.com <your-github-token>`.

### Requirements

| Runtime | Versions |
|---|---|
| PHP | 8.2, 8.3, 8.4 |
| Laravel (optional) | 11, 12, 13 |

The SDK uses PSR-18 and PSR-17 with `php-http/discovery`. It works with any PSR-18 HTTP client. If Guzzle is installed, the SDK uses Guzzle by default.

### Quick start

```php
use FeedbackPilgrim\FeedbackPilgrim;

$pilgrim = new FeedbackPilgrim(
    url: 'https://feedback.example.com',
    token: getenv('FEEDBACKPILGRIM_TOKEN'),
);

$post = $pilgrim->posts()->create('Add dark mode', 'Please add a dark theme.');
```

### Configuration

| Setting | Default | Description |
|---|---|---|
| `url` | (required) | The URL of your instance, with or without a trailing slash. |
| `token` | `null` | An API token, `<id>\|<random>`. A request without a token throws a `MissingCredentialsException`. |
| `identitySecret` | `null` | The identity secret of the project. Only `identityHash()` uses it. |
| `timeout` | `30.0` | Seconds. The SDK uses it only when it makes the Guzzle client. If you give your own client, set its timeout yourself. |
| `retries` | `2` | The number of retries, or a `RetryPolicy`. |
| `httpClient` | Discovered | Any PSR-18 client. |

A `RetryPolicy` has these settings: `retries` (`2`), `baseDelayMs` (`500`), `maxDelayMs` (`8_000`) and `maxRetryAfter` (`60` seconds). `RetryPolicy::none()` stops retries.

```php
use FeedbackPilgrim\Http\RetryPolicy;

$pilgrim = new FeedbackPilgrim($url, $token, retries: new RetryPolicy(retries: 3, maxRetryAfter: 30));
```

In Laravel, the package registers the service provider and the `FeedbackPilgrim` facade automatically. The configuration file reads these environment variables: `FEEDBACKPILGRIM_URL`, `FEEDBACKPILGRIM_TOKEN`, `FEEDBACKPILGRIM_IDENTITY_SECRET`, `FEEDBACKPILGRIM_WEBHOOK_SECRET`, `FEEDBACKPILGRIM_WEBHOOK_TOLERANCE`, `FEEDBACKPILGRIM_TIMEOUT` and `FEEDBACKPILGRIM_RETRIES`. To publish the file, run this command:

```bash
php artisan vendor:publish --tag=feedbackpilgrim-config
```

### Pagination

Each `list()` returns one `Page`. Each `all()` returns a generator that reads all the pages.

```php
$page = $pilgrim->posts()->list(perPage: 100, page: 2);

$page->items;        // list<Post>
$page->currentPage;  // 2
$page->lastPage;
$page->total;
$page->hasMore();    // true when a next page exists
$page->nextPage();   // the next page number, or null

foreach ($pilgrim->contacts()->all(perPage: 100) as $contact) {
    echo $contact->email;
}
```

The default `perPage` of `list()` is 15. The default `perPage` of `all()` is 100.

### Errors

Each exception extends `FeedbackPilgrim\Exceptions\FeedbackPilgrimException`.

| Exception | Cause |
|---|---|
| `AuthenticationException` | `401` |
| `AuthorizationException` | `403` |
| `NotFoundException` | `404` |
| `MethodNotAllowedException` | `405` |
| `ValidationException` | `422`. `errors()` and `first('title')` give the messages. |
| `RateLimitException` | `429`. `retryAfter()`, `limit()` and `remaining()` read the headers. |
| `ServerException` | `5xx` |
| `ApiException` | The parent of the HTTP exceptions above, and the class for another `4xx` status. It has `$status` and `body()`. |
| `ConnectionException` | The SDK got no response. A timeout is a `ConnectionException`. |
| `UnexpectedResponseException` | The body is not the JSON that the SDK expects. |
| `MissingCredentialsException` | A required setting is missing. |
| `WebhookVerificationException` | A webhook delivery is not valid. `$reason` tells why. |

### Retries

The SDK uses the rules in [Retries](#retries). It also waits for a `Retry-After` header on a `5xx` response. `create()` and `signInUrl()` are not idempotent.

### Webhook verification

`Webhook::verify()` returns a `WebhookEvent`, or throws a `WebhookVerificationException`. `Webhook::isValid()` returns a boolean.

```php
use FeedbackPilgrim\Webhooks\Webhook;

$valid = Webhook::isValid(
    payload: $rawBody,
    signature: $signatureHeader,
    timestamp: $timestampHeader,
    secret: $webhookSecret,
    tolerance: 300,
);
```

`verify()` takes the raw body, an array of headers, the secret and the tolerance. The header names ignore case. The `WebhookEvent` has these properties:

- `type`: the event, for example `post.completed`. `is(WebhookEvent::POST_COMPLETED)` compares it.
- `data`: the post, as an array.
- `deliveryId`: the `X-FeedbackPilgrim-Delivery` UUID, or `null` if the header is missing.
- `timestamp`: the Unix time of the attempt.
- `payload`: the decoded body.

The `$reason` of the exception is a `VerificationFailure`: `Signature`, `Timestamp` or `Payload`. `Payload` means that the signature is valid, but the body is not a JSON object.

In Laravel, add the route to `routes/api.php`. The `api` routes have no CSRF check.

```php
use FeedbackPilgrim\Exceptions\WebhookVerificationException;
use FeedbackPilgrim\Webhooks\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

Route::post('/webhooks/feedback-pilgrim', function (Request $request) {
    try {
        $event = Webhook::verify(
            $request->getContent(),
            $request->headers->all(),
            config('feedbackpilgrim.webhook.secret'),
            config('feedbackpilgrim.webhook.tolerance'),
        );
    } catch (WebhookVerificationException) {
        abort(400);
    }

    if (Cache::add("feedbackpilgrim-delivery:{$event->deliveryId}", true, now()->addDay())) {
        ProcessFeedbackEvent::dispatch($event->type, $event->data);
    }

    return response()->noContent();
});
```

`ProcessFeedbackEvent` is a job of your app.

### Identity hash

```php
use FeedbackPilgrim\Identity;

$userHash = Identity::hash($user->email, $identitySecret);

// Or with the identitySecret setting of the client:
$userHash = $pilgrim->identityHash($user->email);
```

In Laravel, `FeedbackPilgrim::identityHash($request->user()->email)` reads the `identity_secret` key of the configuration file.

### Sign-in link

`signInUrl()` sends `POST /api/public/v1/init`. It returns the link, or `null` when the instance gets no email.

```php
$url = $pilgrim->signInUrl('jane@example.com', name: 'Jane Doe', customFields: ['plan' => 'pro']);
```

## Python

The package name is `feedbackpilgrim`. The repository is `amedina068/feedbackpilgrim-python`.

### Install

```bash
pip install "git+https://github.com/amedina068/feedbackpilgrim-python.git"
# or
uv add "git+https://github.com/amedina068/feedbackpilgrim-python.git"
```

Git needs read access to the private repository.

### Requirements

Python 3.10, 3.11, 3.12, 3.13 and 3.14. CI runs the tests, the lint and the type check on each version.

The package has no dependencies. It uses only the standard library. It has full type hints and a `py.typed` file.

### Quick start

```python
from feedbackpilgrim import FeedbackPilgrim

client = FeedbackPilgrim("https://feedback.example.com", token="<your-api-token>")

page = client.posts.list(status="pending", per_page=20)
for post in page:
    print(post.id, post.title)
```

### Configuration

| Setting | Default | Description |
|---|---|---|
| `base_url` | `FEEDBACKPILGRIM_URL` | The URL of your instance. The client removes a trailing `/`, `/api` and `/api/public/v1`. |
| `token` | `FEEDBACKPILGRIM_TOKEN` | An API token. |
| `timeout` | `30.0` | The timeout of the connection and of each read, in seconds. `None` sets no timeout. |
| `max_retries` | `2` | The number of retries. `0` stops retries. |
| `transport` | `UrllibTransport()` | A callable that takes a `Request` and a timeout, and returns a `Response`. Use it for a proxy or another HTTP library. |

The client does not follow redirects, because a redirect can send the token to another host.

Each method returns a frozen dataclass. The `raw` field keeps the decoded JSON object. An argument that breaks a rule raises `ValueError` or `TypeError` before the request. For example, `per_page=200` raises `ValueError`.

### Pagination

`list()` returns one `Page`. `iter()` reads all the pages and yields each record. `iter()` takes the same filters as `list()`, but not `page`.

```python
page = client.posts.list(per_page=50, page=2)
page.data  # a tuple of Post
page.current_page  # 2
page.has_more  # True when a page comes after this page

for contact in client.contacts.iter(tag="vip"):
    print(contact.email)
```

`iter()` uses 100 records on each page by default.

### Errors

```text
FeedbackPilgrimError
├── APIConnectionError        the client did not get a response
│   └── APITimeoutError       the request took more time than the timeout
├── APIError                  the instance sent an error status
│   ├── AuthenticationError   401
│   ├── AuthorizationError    403
│   ├── NotFoundError         404
│   ├── MethodNotAllowedError 405
│   ├── ValidationError       422: .errors has the field errors
│   ├── RateLimitError        429: .retry_after
│   └── ServerError           5xx
└── WebhookVerificationError  a webhook delivery is not valid: .reason
```

Each `APIError` has `status_code`, `message`, `body` and `headers`.

### Retries

The client uses the rules in [Retries](#retries). A custom transport tells the client whether the instance got the request: raise `APIConnectionError(message, request_sent=False)` only when the instance did not get it. Then the client can retry a `POST`.

### Webhook verification

`construct_event()` verifies a delivery and returns a `WebhookEvent`. `verify_signature()` returns a boolean.

```python
import os

from feedbackpilgrim import WebhookVerificationError, construct_event, verify_signature

secret = os.environ["FEEDBACKPILGRIM_WEBHOOK_SECRET"]

try:
    event = construct_event(raw_body, headers, secret, tolerance=300)
except WebhookVerificationError as error:
    ...  # Send 400. error.reason is "signature" or "timestamp".

valid = verify_signature(
    raw_body,
    headers.get("X-FeedbackPilgrim-Signature-V2"),
    headers.get("X-FeedbackPilgrim-Timestamp"),
    secret,
)
```

The header names are not case-sensitive. The `WebhookEvent` has these fields:

- `type`: `post.created`, `post.status_changed` or `post.completed`.
- `delivery_id`: the UUID of the delivery, or `None` if the header is missing.
- `timestamp`: the Unix time of the attempt.
- `post`: `id`, `title`, `content`, `status`, `board_id`, `contact_id` and `stage`.
- `raw`: the decoded body.

In Django, the view must be `csrf_exempt`, because Feedback Pilgrim does not send a CSRF token:

```python
from django.conf import settings
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from feedbackpilgrim import WebhookVerificationError, construct_event


@csrf_exempt
@require_POST
def feedbackpilgrim_webhook(request: HttpRequest) -> HttpResponse:
    try:
        event = construct_event(
            request.body, request.headers, settings.FEEDBACKPILGRIM_WEBHOOK_SECRET
        )
    except WebhookVerificationError:
        return HttpResponseBadRequest()

    _, first_time = ProcessedDelivery.objects.get_or_create(delivery_id=event.delivery_id)
    if first_time and event.type == "post.completed":
        notify_voters(event.post.id)
    return HttpResponse(status=204)
```

`ProcessedDelivery` is a model of your app with a unique `delivery_id` field. The README of the SDK also has a FastAPI example.

### Identity hash

```python
from feedbackpilgrim import identity_hash

user_hash = identity_hash(user.email, identity_secret)
```

Do not normalize the email with `str.strip()` or `str.lower()` first. They also change Unicode characters, and then the hash does not match.

### Sign-in link

`sign_in_url()` sends `POST /api/public/v1/init` and returns the link. If the instance sends no link, it raises `FeedbackPilgrimError`.

```python
url = client.sign_in_url("jane@example.com", name="Jane Doe", custom_fields={"plan": "premium"})
```

## Ruby

The gem name is `feedbackpilgrim`. The repository is `amedina068/feedbackpilgrim-ruby`. The gem has a Rails integration.

### Install

1. Add the gem to your Gemfile:

   ```ruby
   gem "feedbackpilgrim", github: "amedina068/feedbackpilgrim-ruby"
   ```

2. Run `bundle install`.

Bundler needs read access to the private repository.

### Requirements

- Ruby 3.2, 3.3 and 3.4
- Rails 7.2, 8.0 and 8.1 (optional)

The gem uses only the Ruby standard library. It has no runtime dependencies.

### Quick start

```ruby
require "feedbackpilgrim"

FeedbackPilgrim.configure do |config|
  config.url   = "https://feedback.example.com"
  config.token = ENV["FEEDBACKPILGRIM_TOKEN"]
end

FeedbackPilgrim.posts.list(status: "pending").each do |post|
  puts post.title
end
```

### Configuration

| Setting | Default | Description |
|---|---|---|
| `url` | `FEEDBACKPILGRIM_URL` | The URL of your instance. The client adds `/api/public/v1`. |
| `token` | `FEEDBACKPILGRIM_TOKEN` | An API token. |
| `identity_secret` | `FEEDBACKPILGRIM_IDENTITY_SECRET` | The identity secret of the project. Only `FeedbackPilgrim.identity_hash` uses it. |
| `webhook_secret` | `FEEDBACKPILGRIM_WEBHOOK_SECRET` | The signing secret of your webhook. Only the webhook helpers use it. |
| `timeout` | `30` | The seconds to wait for a connection and for a response. |
| `max_retries` | `2` | The number of retries. `0` stops retries. |

`FeedbackPilgrim.posts` and the other module methods use the default client. For more than one instance or project, make a client for each one:

```ruby
client = FeedbackPilgrim::Client.new(url: "https://feedback.example.com", token: ENV["FEEDBACKPILGRIM_TOKEN"], timeout: 10)
client.tags.list
```

In Rails, the Railtie reads `Rails.application.credentials.feedbackpilgrim` with the keys `url`, `token`, `identity_secret` and `webhook_secret`. To write an initializer, run `bin/rails generate feedbackpilgrim:install`. The initializer runs after the Railtie, and its values replace the credentials.

### Pagination

A list returns one `FeedbackPilgrim::Page`. `each_record` reads all the pages. Without a block, it returns an `Enumerator`.

```ruby
page = FeedbackPilgrim.posts.list(per_page: 100)
page.records          # an Array of Records
page.meta.total
page.next_page?       # true when a next page exists
page = page.next_page # the next Page, with the same filters

FeedbackPilgrim.contacts.list(per_page: 100).each_record do |contact|
  puts contact.email
end
```

### Errors

Each error is a `FeedbackPilgrim::Error`.

| Error | Cause |
|---|---|
| `ConfigurationError` | The `url`, the `token` or a secret is missing. |
| `ConnectionError` | The connection failed, timed out, or had a TLS error. `cause` gives the original error. |
| `AuthenticationError` | `401` |
| `AuthorizationError` | `403` |
| `NotFoundError` | `404` |
| `MethodNotAllowedError` | `405` |
| `ValidationError` | `422`. `errors` gives the messages for each field. |
| `RateLimitError` | `429`. `retry_after` gives the seconds to wait. |
| `ServerError` | `500` or more |
| `ApiError` | Another status. All the HTTP errors above are an `ApiError`. Each has `status`, `body` and `message`. |
| `WebhookVerificationError` | A webhook delivery is not valid. `reason` is `:signature` or `:timestamp`. |

### Retries

The client uses the rules in [Retries](#retries). Each `POST` is not idempotent, except `contacts.upsert`.

### Webhook verification

`FeedbackPilgrim::Webhook.verify` returns a `FeedbackPilgrim::Webhook::Event`, or raises `FeedbackPilgrim::WebhookVerificationError`. `valid?` returns `true` or `false`. `sign` makes a signature for your tests.

```ruby
event = FeedbackPilgrim::Webhook.verify(request.raw_post, request.headers, tolerance: 300)
event.name         # "post.status_changed"
event.data.title   # the title of the post
event.delivery_id  # the X-FeedbackPilgrim-Delivery UUID, or nil
event.timestamp    # a Time

FeedbackPilgrim::Webhook.valid?(
  request.raw_post,
  signature: request.headers["X-FeedbackPilgrim-Signature-V2"],
  timestamp: request.headers["X-FeedbackPilgrim-Timestamp"]
)
```

The helpers read the secret from `webhook_secret`. Give `secret:` to use another secret. The headers can be the Rails `request.headers`, a Rack env or a Hash.

In Rails:

```ruby
# config/routes.rb
post "/webhooks/feedbackpilgrim" => "feedbackpilgrim_webhooks#create"

# app/controllers/feedbackpilgrim_webhooks_controller.rb
class FeedbackpilgrimWebhooksController < ActionController::API
  def create
    event = FeedbackPilgrim::Webhook.verify(request.raw_post, request.headers)

    if ProcessedDelivery.create_or_find_by(delivery_id: event.delivery_id).previously_new_record?
      PostChangedJob.perform_later(event.name, event.data.to_h)
    end

    head :ok
  rescue FeedbackPilgrim::WebhookVerificationError
    head :bad_request
  end
end
```

`ProcessedDelivery` and `PostChangedJob` are examples from your app. The gem does not add them.

### Identity hash

```ruby
user_hash = FeedbackPilgrim.identity_hash(current_user.email)
user_hash = FeedbackPilgrim.identity_hash(current_user.email, secret: other_project_secret)
```

Without `secret:`, the method uses the `identity_secret` setting.

### Sign-in link

`sign_in_url` sends `POST /api/public/v1/init` and returns the link. If the API returns `[]`, it returns `nil`.

```ruby
url = FeedbackPilgrim.sign_in_url(email: current_user.email, name: current_user.name, custom_fields: { plan: "pro" })
redirect_to url, allow_other_host: true
```
