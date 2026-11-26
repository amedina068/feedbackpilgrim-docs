---
title: Configuration
description: The environment variables of Feedback Pilgrim, and how the dashboard domain and the project subdomains work.
order: 4
---

# Configuration

Feedback Pilgrim reads its configuration from environment variables. The file `.env.example` in the repository explains each value. This page lists the values that an instance needs.

The Docker image needs no variable on localhost. On a server, `APP_DOMAIN` is the only required variable. The image makes `APP_KEY` on the first start and keeps it in the `/data` volume.

To set a variable:

- With `docker run`, add `-e NAME=value` or `--env-file <file>`. Then remove the container and start it again with the same volume.
- With Docker Compose, put the value in `.env`. Then run `docker compose up -d`.
- Without Docker, put the value in `.env`. Then run `php artisan optimize` and `php artisan queue:restart`.

To see the values that the app uses, run `php artisan fp:status --json`. To find a wrong value, run `php artisan fp:doctor`.

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

Set only `APP_DOMAIN`. The app derives the other four values from it: `APP_URL` is `https://<APP_DOMAIN>`, and the cookie and Sanctum values cover the domain and its wildcard. If you set `APP_URL`, the app derives the values from `APP_URL` instead. Set a value yourself only to change the derived value.

The app trusts the `X-Forwarded-*` headers from any proxy. Read [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md).

## Application

| Variable | Default in `.env.example` | What it does |
|---|---|---|
| `APP_NAME` | `"Feedback Pilgrim"` | The name of the app in the pages and the emails. |
| `APP_ENV` | `production` | The environment. Use `local` for development. |
| `APP_KEY` | empty | The encryption key. The Docker image makes it on the first start and keeps it in `/data`. Without Docker, make it with `php artisan key:generate --show`. |
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

The Docker image uses SQLite by default. The database file is in the `/data` volume. SQLite is enough for one server.

To use MySQL, set `DB_CONNECTION=mysql` and the other `DB_*` values. The Compose file of the repository starts MySQL 8.4 with the `mysql` profile and sets `DB_HOST` and `DB_PORT`. Read [Install with Docker](installation-docker.md#mysql-and-redis).

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

Redis is optional. Without Redis, the Docker image keeps the cache, the sessions and the queue in the database. The Compose file with the `mysql` profile also starts Redis 7.4.

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
| `CADDY_ENABLED` | `auto` | `auto` starts Caddy with automatic HTTPS only when `APP_DOMAIN` is set. `true` always starts it. `false` never starts it, for example behind your own proxy. The Compose files set `false`. |
| `ACME_EMAIL` | empty | Optional. Let's Encrypt sends notices about the certificates to this address. |

## Docker Compose only

| Variable | Default | What it does |
|---|---|---|
| `APP_PORT` | `8080` | The port of the host that Compose publishes for the `web` service. |
| `APP_BIND` | `127.0.0.1` | The interface of the host for `APP_PORT`. With `127.0.0.1`, only a proxy on the same host can reach the app. Set `0.0.0.0` to accept traffic from other hosts. |
