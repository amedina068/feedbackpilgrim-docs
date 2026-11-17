---
title: Troubleshooting
description: Find the cause of common problems with the domains, the widget, the API, the emails and the Docker stack.
order: 7
---

# Troubleshooting

## Read the log

With Docker, set `LOG_STACK=stderr` in `.env`, then read the log of a service:

```bash
docker compose logs web
docker compose logs queue
```

Without Docker, the default `LOG_STACK=daily` writes the log to `storage/logs`.

## The public site of a project returns 404

1. Make sure that the DNS has a wildcard record for `APP_DOMAIN`, for example `*.feedback.example.com`.
2. Make sure that the reverse proxy sends the wildcard to the app, with the original `Host` header.
3. Make sure that `APP_DOMAIN` is the parent of the project host. For `acme.feedback.example.com`, `APP_DOMAIN` is `feedback.example.com`.
4. Make sure that the subdomain is the slug of a project, and is not reserved.
5. Make sure that the project has at least one active user. If every user of the project is deactivated, the public site returns 404.

## The dashboard does not load, or `/setup` sends you to the wrong host

The dashboard routes answer only on the host of `APP_URL`. Make sure that `APP_URL` has the host that you open in the browser.

## The Public Site link does not sign you in

The public site reads the dashboard session through the cookie domain.

1. Make sure that `SESSION_DOMAIN` starts with a dot, for example `.feedback.example.com`.
2. If `APP_URL` uses `https`, make sure that `SESSION_SECURE_COOKIE` is `true`.
3. For local work on `http`, set `SESSION_DOMAIN=null` and `SESSION_SECURE_COOKIE=false`.

## Links use `http` instead of `https`

1. Make sure that `APP_URL` starts with `https://`.
2. Make sure that the reverse proxy sends `X-Forwarded-Proto`.

## The widget gets 401, 403 or 422

| Status | Cause | Fix |
|---|---|---|
| `401` | The `data-client` value is not a publishable key of a project, or every user of the project is deactivated. | Copy the publishable key from **Settings > Embed Widget**. |
| `403` | The `userHash` is wrong, or it is missing and verification is required. | Make the hash from the lowercase, trimmed email with the current identity secret. |
| `422` | The call has no contact email. | Send `contact.email`. |

Read [The embeddable widget](../using-feedback-pilgrim/widget.md).

## The widget does not sign in an existing user

Without a valid `userHash`, the widget does not sign in a contact that exists already. Send `userHash`. Read [Identity verification](../using-feedback-pilgrim/widget.md#identity-verification).

## The API or the MCP server returns 401

1. Make sure that you send the full token, with the part before the `|`.
2. Make sure that you send `Accept: application/json`.
3. Make sure that the user of the token is active, and is still a member of the project.
4. Make sure that nobody deleted the token in **Settings > API Tokens**.

## Emails do not arrive

1. Make sure that the queue worker runs. With Docker, run `docker compose ps` and look at the `queue` service.
2. Look for failed jobs with `php artisan queue:failed`.
3. Make sure that the `MAIL_*` values are correct. Read [Mail](mail.md).

## Webhooks or Slack messages do not arrive

1. Make sure that the queue worker runs.
2. Open **Settings > Webhooks** and read the delivery log of the webhook.
3. Make sure that the webhook is active and has the event.
4. Remember that a status change from the REST API or the MCP server sends no event.

## The weekly report does not arrive

1. Make sure that the scheduler runs. With Docker, look at the `scheduler` service.
2. Run `php artisan schedule:list`. The list must show `fp:weekly`.
3. Remember that the time is 09:00 UTC on Monday.

## A change in `.env` has no effect

The app caches the configuration. With Docker, run `docker compose up -d`. Without Docker, run `php artisan optimize`, then `php artisan queue:restart`.

## The `web` service is not healthy

1. Read `docker compose logs web`.
2. If the log shows a database error, make sure that `DB_PASSWORD` in `.env` is the password of the `mysql` volume. MySQL sets the password only when it creates the volume.
3. Open `/up` on the host. It must return status 200.

## An uploaded file returns 404

The app serves uploads through the link `public/storage`. Create the link:

```bash
php artisan fp:install --prepare
```
