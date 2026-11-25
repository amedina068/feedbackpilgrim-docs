---
title: Troubleshooting
description: Find the cause of common problems with the domains, the widget, the API, the emails and the Docker stack.
order: 7
---

# Troubleshooting

## Run the doctor

`fp:doctor` checks the database, the migrations, the queue, the scheduler, the storage link, the mail settings and the domain values. For each problem, it gives the fix.

```bash
docker exec feedbackpilgrim php artisan fp:doctor
```

- Add `--fix` to apply the safe fixes, for example a missing storage link.
- Add `--json` to get one JSON object for a script or an AI agent.
- Run `fp:status --json` for a short summary of the instance.

## Read the log

With the Docker image, the log goes to the container log:

```bash
docker logs --tail 100 feedbackpilgrim
```

With Docker Compose, read the log of the `web` service:

```bash
docker compose logs web
```

Without Docker, the default `LOG_STACK=daily` writes the log to `storage/logs`.

## The installer stops

The installer prints an `Error:` line and a `Fix:` line. Do the fix, then run the installer again. The full log is in `/tmp/feedbackpilgrim-install.log`.

| Error | Cause |
|---|---|
| `Docker is not installed.` | Install Docker with `curl -fsSL https://get.docker.com \| sh`. |
| `Your user cannot use Docker.` | Run the installer with `sudo`, or add your user to the `docker` group. |
| `Port 80 is in use.` | Another web server uses the port. Stop it, or read [Reverse proxy and TLS](reverse-proxy-and-tls.md#your-own-proxy). |
| `The container stopped.` | Read `docker logs feedbackpilgrim`. |

## The setup page asks for the setup URL

The page "Find the setup URL" shows when you open `/setup` without the correct token. The token is in the setup URL. Run `docker logs feedbackpilgrim` or `php artisan fp:setup-url`, then open the URL from the output.

If the token in the URL is not correct, `APP_KEY` changed after the log printed the URL. Run `fp:setup-url` again.

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

1. Make sure that the queue worker runs. Run `php artisan fp:status` and read the queue heartbeat.
2. Look for failed jobs with `php artisan queue:failed`.
3. Make sure that the `MAIL_*` values are correct. Read [Mail](mail.md).

## Webhooks or Slack messages do not arrive

1. Make sure that the queue worker runs.
2. Open **Settings > Webhooks** and read the delivery log of the webhook.
3. Make sure that the webhook is active and has the event.
4. If the receiver refuses the requests with `401`, make sure that it verifies `X-FeedbackPilgrim-Signature-V2` with the timestamp. Read [Verify the signature](../using-feedback-pilgrim/webhooks-and-slack.md#verify-the-signature).

## The weekly report does not arrive

1. Make sure that the scheduler runs. With Docker, look at the `scheduler` service.
2. Run `php artisan schedule:list`. The list must show `fp:weekly`.
3. Remember that the time is 09:00 UTC on Monday.

## A change in `.env` has no effect

The app caches the configuration. With `docker run`, remove the container and start it again with the new values. With Docker Compose, run `docker compose up -d`. Without Docker, run `php artisan optimize`, then `php artisan queue:restart`.

## The container is not healthy

1. Read `docker logs feedbackpilgrim`, or `docker compose logs web` with Compose.
2. If the log shows a database error, make sure that `DB_PASSWORD` in `.env` is the password of the `mysql` volume. MySQL sets the password only when it creates the volume.
3. Open `/up` on the host. It must return status 200.

## An uploaded file returns 404

The app serves uploads through the link `public/storage`. Create the link:

```bash
php artisan fp:install --prepare
```
