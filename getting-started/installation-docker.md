---
title: Install with Docker
description: Run Feedback Pilgrim with Docker Compose, create the owner account and open the dashboard.
order: 2
---

# Install with Docker

The repository has a `Dockerfile` and a `docker-compose.yml`. The Compose stack has five services:

| Service | Image | What it does |
|---|---|---|
| `web` | `feedbackpilgrim:local` (built from the `Dockerfile`) | PHP-FPM and NGINX. Serves the app on port 8080. Runs the migrations at start. |
| `queue` | `feedbackpilgrim:local` | Runs `php artisan queue:work --tries=3`. |
| `scheduler` | `feedbackpilgrim:local` | Runs `php artisan schedule:work`. |
| `mysql` | `mysql:8.4` | The database. |
| `redis` | `redis:7.4-alpine` | The cache, the sessions, the queue and the last-login times. |

The app image is based on `serversideup/php:8.3-fpm-nginx-v5.1.2`. The build adds the PHP extensions `gd` and `exif`. It also builds the dashboard assets and `public/pilgrim.js` with Node.js 24.

Each release also publishes a prebuilt image to the GitHub Container Registry, for `linux/amd64` and `linux/arm64`. The file `docker-compose.image.yml` is the same stack, but it uses this image and does not build:

1. Put `docker-compose.image.yml` and `.env.example` in an empty folder.
2. Do steps 2 to 5 of the installation below.
3. Start the stack:

   ```bash
   docker compose -f docker-compose.image.yml up -d
   ```

4. Do steps 7 to 9 of the installation below. Add `-f docker-compose.image.yml` to each `docker compose` command.

`FEEDBACKPILGRIM_IMAGE` selects the image. The default in `docker-compose.image.yml` is `ghcr.io/amedina068/feedbackpilgrim`. Set `FEEDBACKPILGRIM_IMAGE` in `.env` only to run an image from another registry or a fork. Use lowercase, because a Docker image name must be lowercase.

`FEEDBACKPILGRIM_VERSION` selects the image tag. The default is `latest`. To stay on one version, set an exact version, for example `FEEDBACKPILGRIM_VERSION=0.1.0`.

## Requirements

- Docker with the Compose plugin.
- `git` and `openssl`.
- A domain for the dashboard, for example `feedback.example.com`.
- Two DNS records that point to your server: the dashboard domain and a wildcard for the projects, for example `*.feedback.example.com`.
- A TLS certificate for both names. Read [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md).

## Install

1. Clone the repository and go into its folder:

   ```bash
   git clone https://github.com/amedina068/feedbackpilgrim.git
   cd feedbackpilgrim
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Make the app key and the database password:

   ```bash
   echo "APP_KEY=base64:$(openssl rand -base64 32)"
   echo "DB_PASSWORD=$(openssl rand -hex 16)"
   ```

4. Put the two values in `.env`.
5. Set these values in `.env`:

   | Variable | Value |
   |---|---|
   | `APP_DOMAIN` | Your dashboard domain, for example `feedback.example.com` |
   | `APP_URL` | `https://feedback.example.com` |
   | `SESSION_DOMAIN` | `.feedback.example.com` (with the leading dot) |
   | `SANCTUM_STATEFUL_DOMAINS` | `feedback.example.com,*.feedback.example.com` |
   | `LOG_STACK` | `stderr`, so that `docker compose logs` shows the log of the app |
   | `MAIL_*` | Your SMTP server. Read [Mail](../self-hosting/mail.md). |

6. Build and start the stack:

   ```bash
   docker compose up -d --build
   ```

7. Wait until all the services are healthy:

   ```bash
   docker compose ps
   ```

8. Read the setup URL in the log of the `web` service:

   ```bash
   docker compose logs web
   ```

9. Open the setup URL.
10. Type the name, the email and the password of the owner.
11. Type the name and the subdomain of the first project. Then the app signs you in.

If `DB_PASSWORD` is empty, `docker compose` stops with the error `Set DB_PASSWORD in .env`.

Read [Configuration](configuration.md) for all the environment variables.

## The setup URL

The setup page at `/setup` creates the owner account and the first project. It is open only while the instance has no user. After the first user exists, `/setup` returns 404. The page allows 10 requests a minute.

The setup URL holds a token. The app makes the token from `APP_KEY` with HMAC-SHA256, so the instance stores no token. If `APP_KEY` changes, the token changes.

If you lose the setup URL, show it again:

```bash
docker compose exec web php artisan fp:setup-url
```

To create the owner in the terminal instead of the setup page, run this command. It asks for each value:

```bash
docker compose exec web php artisan fp:install
```

You can also give the values as options: `--name`, `--email`, `--password`, `--client-name` and `--subdomain`. Read [Accounts and registration](../self-hosting/accounts-and-registration.md) for the details.

## The subdomain of a project

The subdomain is the slug of the project. It must use lowercase letters, digits and single hyphens, for example `acme` or `acme-app`. It must be unique on the instance.

These subdomains are reserved: `admin`, `api`, `app`, `assets`, `blog`, `cdn`, `dashboard`, `dev`, `docs`, `help`, `mail`, `mcp`, `smtp`, `staging`, `static`, `status`, `support` and `www`.

## What the `web` service does at start

1. The serversideup entrypoint runs the Laravel automations, because Compose sets `AUTORUN_ENABLED=true` for `web` only. These run `storage:link`, the migrations and `optimize`.
2. The script `deploy/docker/entrypoint.d/60-feedbackpilgrim-setup.sh` runs `php artisan fp:install --prepare`. This command creates the storage link if it is missing.
3. While no account exists, the script prints the setup URL to the log.

Only `web` sets `FP_PREPARE_ON_START=true`, so only `web` does steps 2 and 3. The `queue` and `scheduler` services start after `web` is healthy.

## Settings that Compose sets

`docker-compose.yml` sets these values for the app services. Do not set them in `.env`, because the Compose values win:

| Variable | Value |
|---|---|
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `mysql` |
| `DB_PORT` | `3306` |
| `REDIS_HOST` | `redis` |
| `REDIS_PORT` | `6379` |

The `mysql` service reads `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` from `.env`. The default database name and user are both `feedbackpilgrim`. The root password of MySQL is random.

## Volumes

| Volume | Mounted at | Content |
|---|---|---|
| `storage` | `/var/www/html/storage/app` | The uploads: post attachments, comment photos, avatars and logos. |
| `mysql` | `/var/lib/mysql` | The database files. |
| `redis` | `/data` | The Redis data. Redis runs with `--appendonly yes`. |

The log files of the app are not on a volume. Set `LOG_STACK=stderr` and read the log with `docker compose logs`.

Make a backup of the volumes and of `.env`. Read [Backups](../self-hosting/backups.md).

## Ports and health checks

The `web` service answers on port 8080 of the loopback interface (`127.0.0.1`) of the host. Thus only a proxy on the same host can reach it. To change the port, set `APP_PORT` in `.env`. To accept traffic from other hosts, set `APP_BIND=0.0.0.0`.

The stack does not serve HTTPS. Put a reverse proxy with TLS in front of it. Read [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md).

The image sets `HEALTHCHECK_PATH=/up`. The `/up` route answers on any host. The `queue` and `scheduler` services use the health checks `healthcheck-queue` and `healthcheck-schedule` of the base image.

## Next steps

- [Configuration](configuration.md)
- [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md)
- [Projects and the public site](../using-feedback-pilgrim/projects-and-public-site.md)
- [Upgrading](upgrading.md)
