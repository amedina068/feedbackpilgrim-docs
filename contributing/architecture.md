---
title: Architecture
description: The request surfaces, the tenancy rules, the domain model and the build targets of the Feedback Pilgrim code.
order: 1
---

# Architecture

This page is a short map of the code. The file `ARCHITECTURE.md` in the app repository has the full details. Read it before a large change.

## Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 13 with the streamlined skeleton, PHP 8.3 |
| Frontend | Vue 3, Alpine.js, Tailwind CSS 4, Quill, Chart.js |
| Build | Vite 8, with two build targets |
| Auth | Session guards `web` (users) and `contact` (contacts), and Laravel Sanctum for API tokens |
| Uploads | Spatie Media Library on the `public` disk |
| MCP | `laravel/mcp` |
| Audit | `spatie/laravel-activitylog` |

`bootstrap/app.php` holds the routing, the middleware aliases and the exception handling. The app has no `app/Http/Kernel.php` and no `app/Console/Kernel.php`.

## Request surfaces

The same data goes through several surfaces. The code groups the routes, the controllers and the views by surface.

| Surface | Host | Auth | Code | Routes |
|---|---|---|---|---|
| Dashboard | The host of `APP_URL` | `auth` (user) | `PostController`, `ReleaseNoteController` and others | `routes/web.php`, `routes/auth.php` |
| Admin area | The host of `APP_URL`, `/admin` | `owner` | `App\Http\Controllers\Admin\*` | `routes/web.php` |
| Public site | A project subdomain | `auth:contact` or none | `Client*` controllers | `routes/web.php` |
| Iframes | A project subdomain | None | `Iframe*` controllers | `routes/iframe.php` |
| Widget API | Any host, `/api/v1` | Publishable key (`widget_client`) or the project host | `App\Http\Controllers\Api\*` | `routes/api.php` |
| REST API | Any host, `/api/public/v1` | Sanctum token and `api_client` | `App\Http\Controllers\Api\V1\Public\*` | `routes/public-api.php` |
| MCP server | Any host, `/mcp` | Sanctum token, `api_client` and `throttle:mcp` | `App\Mcp\Servers\PublicServer` and `App\Mcp\Tools\*` | `routes/ai.php` |
| Guides and API reference | The host of `APP_URL`, `/documentation` | None | `DocumentationController` | `routes/web.php` |

## Shared logic of the REST API and the MCP server

The REST API and the MCP server call the same code:

- **Actions** in `app/Actions/<Resource>/` hold the read and write behavior. Each action is an invokable class that takes a `ClientContext` and an input array.
- **Rules** in `app/Rules/Public/*Rules.php` are the only source of validation for each resource.
- `App\Support\ClientContext` resolves the project and the user from the token. A request never gives the project. The dashboard calls some actions too (the release note edit page, the tag rename and delete). It builds the context from the session project with `ClientContext::fromDashboard()`.

The controllers and the MCP tools are thin. A contract test (`tests/Feature/Mcp/ContractTest.php`) makes sure that the rules, the MCP tool schemas and `public/docs/openapi.json` agree.

## Tenancy

The project (`Client`) is the tenant root. Each domain record except `User` has a `client_id`.

| Surface | How the app finds the project |
|---|---|
| Public site and iframes | `IdentifyClientMiddleware` reads the host. A subdomain of `APP_DOMAIN` is the slug of a project. Another host gets 404. Custom domains are not supported. |
| Dashboard | `GrabClientIdFromSessionMiddleware` reads `fp_client_id` from the session, or uses the first project of the user. Request input never sets the project. |
| Widget `init` | `IdentifyWidgetClientMiddleware` reads the publishable key from the bearer header. |
| REST API and MCP | `ApiClientMiddleware` builds a `ClientContext` from the `client_id` of the Sanctum token. |

## Domain model

```text
User ──many-to-many (client_user)── Client
                                      ├─ Contact ──< Vote, Comment, Post, Testimonial
                                      ├─ Board ──< Post
                                      ├─ Stage ──< Post
                                      ├─ Post (tags, votes, comments, attachments)
                                      ├─ ReleaseNote (tags, votes, comments)
                                      ├─ Testimonial (votes, comments)
                                      ├─ Tag (on Post, Contact and ReleaseNote)
                                      ├─ ClientSetting (key and value)
                                      ├─ ContactAttribute (custom attribute names)
                                      ├─ Webhook ──< WebhookDelivery
                                      └─ WeeklyReport
```

- `Comment` and `Vote` are polymorphic across Post, ReleaseNote and Testimonial.
- The stage of a post is the source of truth. The `status` field mirrors it. `Post::booted()` keeps the two in step.
- `InstanceSetting` holds the settings of the instance, for example the registration mode. It has no `client_id`.

## Background work

| Kind | Classes |
|---|---|
| Jobs | `SyncContactAttributes`, `DeliverWebhook`, `SendSlackMessage` |
| Observer | `ContactObserver` queues `SyncContactAttributes` when the metadata changes. |
| Event and listener | `PostCompletedEvent` and `RequestTestimonial` |
| Notifications | `PostCommented`, `PostCompletedNotification`, `PostStatusChangedNotification`, `PostCreatedByContact`, `ReleaseNoteCommented`, `WeeklyReportNotification` |
| Schedule | `fp:weekly` every Monday at 09:00, in `routes/console.php` |

`App\Support\PostStageTransition` runs a stage change from the dashboard, and a status change from the REST API or the MCP server (`UpdatePost`). It sends the notifications, the webhook events and the Slack message.

## Build targets

`npm run build` makes two bundles:

1. The dashboard (`vite.config.js`): `resources/css/app.css` and `resources/js/app.js` to `public/build/`.
2. The widget (`vite.config.external-script.js`): `resources/js/pilgrim.js` to `public/pilgrim.js`. The widget reads the server URL from its own script tag, so one build works on every host.

## Key folders

| Folder | Content |
|---|---|
| `app/Actions` | The shared logic of the REST API and the MCP server |
| `app/Console/Commands` | The `fp:*` commands |
| `app/Http/Controllers` | The controllers of each surface |
| `app/Mcp` | The MCP server, the tools and the response helpers |
| `app/Models` | The domain models |
| `app/Rules/Public` | The validation rules of the REST API and the MCP server |
| `app/Support` | Helpers, for example `ClientContext`, `PostMerger` and `WebhookDispatcher` |
| `deploy/docker` | The start script of the Docker image |
| `public/docs/openapi.json` | The OpenAPI document |
| `resources/js` | `app.js`, `pilgrim.js`, the Vue components |
| `routes` | `web`, `auth`, `api`, `public-api`, `iframe`, `ai` and `console` |
