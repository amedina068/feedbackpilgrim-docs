---
title: Configuration
description: The environment variables of Feedback Pilgrim, and how the dashboard domain and the project subdomains work.
order: 5
---

# Configuration

Feedback Pilgrim reads its configuration from `.env`. The file `.env.example` in the repository explains each value. This page lists the values that an instance needs.

After a change to `.env`:

- With Docker, run `docker compose up -d`. Compose makes the app containers again, and `web` caches the configuration again at start.
- Without Docker, run `php artisan optimize` and `php artisan queue:restart`.

## Domains

The app has two kinds of hosts:

- The **app host** is the host of `APP_URL`. It serves the dashboard, the login pages, the admin area, the guides at `/documentation`, the REST API and the MCP server.
- Each **project** has a public site on a subdomain of `APP_DOMAIN`, for example `acme.feedback.example.com`.

The app finds the project from the subdomain. The app host and `APP_DOMAIN` itself are never a project. A reserved subdomain (for example `www` or `api`) is never a project.

`APP_DOMAIN` can be the same as the app host, or its parent. For example, the dashboard can be on `app.example.com` and the projects on `<slug>.example.com`.

| Variable | Example | What it does |
|---|---|---|
| `APP_URL` | `https://feedback.example.com` | The full URL of the dashboard. Its scheme (`http` or `https`) is also the scheme of the public sites. |
| `APP_DOMAIN` | `feedback.example.com` | The base domain of the public sites. The DNS needs a wildcard record for it. |
| `SESSION_DOMAIN` | `.feedback.example.com` | The leading dot shares the dashboard session with the project subdomains. The **Public Site** link of the dashboard needs it. |
| `SESSION_SECURE_COOKIE` | `true` | Set `true` when `APP_URL` uses `https`. |
| `SANCTUM_STATEFUL_DOMAINS` | `feedback.example.com,*.feedback.example.com` | The domains that can call the API with the session cookie. List the dashboard domain and the wildcard of the projects. |

The app trusts the `X-Forwarded-*` headers from any proxy. Read [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md).

## Application

| Variable | Default in `.env.example` | What it does |
|---|---|---|
| `APP_NAME` | `"Feedback Pilgrim"` | The name of the app in the pages and the emails. |
| `APP_ENV` | `production` | The environment. Use `local` for development. |
| `APP_KEY` | empty | The encryption key. Make it with `php artisan key:generate --show`. |
| `APP_DEBUG` | `false` | Shows error details. Keep it `false` in production. |
| `REGISTRATION_ENABLED` | `false` | The default registration mode. `true` is open, `false` is closed. Read [Accounts and registration](../self-hosting/accounts-and-registration.md). |

WARNING: Make a backup of `APP_KEY`. The app uses it to encrypt the identity secret of each project and to sign the sign-in links of the contacts. If the key changes, the stored identity secrets cannot be read, and the old links stop working.

## Database

| Variable | Default in `.env.example` |
|---|---|
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | `feedbackpilgrim` |
| `DB_USERNAME` | `feedbackpilgrim` |
| `DB_PASSWORD` | empty |

With Docker, Compose sets `DB_CONNECTION`, `DB_HOST` and `DB_PORT`. Read [Install with Docker](installation-docker.md#settings-that-compose-sets).

## Redis, cache, sessions and queue

| Variable | Default in `.env.example` | What it does |
|---|---|---|
| `REDIS_CLIENT` | `phpredis` | The Redis client. |
| `REDIS_HOST` | `127.0.0.1` | The Redis host. |
| `REDIS_PASSWORD` | `null` | The Redis password. |
| `REDIS_PORT` | `6379` | The Redis port. |
| `CACHE_DRIVER` | `redis` | The cache store. |
| `QUEUE_CONNECTION` | `redis` | The queue. Read [Queues and the scheduler](../self-hosting/queues-and-scheduler.md). |
| `SESSION_DRIVER` | `redis` | The session store. |
| `SESSION_LIFETIME` | `120` | The session lifetime in minutes. |

The repository has no migration for a `sessions` table or a `jobs` table. Thus the `database` session driver and the `database` queue connection do not work without extra migrations.

## Logging

| Variable | Default in `.env.example` | What it does |
|---|---|---|
| `LOG_CHANNEL` | `stack` | The log channel. |
| `LOG_STACK` | `daily` | A comma-separated list of channels. Use `stderr` with Docker. Add `rollbar` to send errors to Rollbar. |
| `LOG_LEVEL` | `info` | The lowest level that the log keeps. |
| `ROLLBAR_TOKEN` | empty | The access token of Rollbar. |

## Mail

SMTP is the default mailer. Mailgun and Amazon SES are optional. Read [Mail](../self-hosting/mail.md) for the variables.

## Files

The uploads go to the `public` disk, that is `storage/app/public`, through the storage link `public/storage`. `FILESYSTEM_DISK` is `local` in `.env.example`.

The app does not support S3 storage for the uploads. The configuration has an `s3` disk, but the S3 driver needs the package `league/flysystem-aws-s3-v3`. The app does not include this package, so each read or write on the `s3` disk fails. Do not set `FILESYSTEM_DISK` or `MEDIA_DISK` to `s3`.

## Docker only

| Variable | Default | What it does |
|---|---|---|
| `APP_PORT` | `8080` | The port of the host that Compose publishes for the `web` service. |
| `APP_BIND` | `127.0.0.1` | The interface of the host for `APP_PORT`. With `127.0.0.1`, only a proxy on the same host can reach the app. Set `0.0.0.0` to accept traffic from other hosts. |
