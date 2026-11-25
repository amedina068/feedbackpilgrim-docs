---
title: Install with Docker
description: Run Feedback Pilgrim in one container with one volume, get HTTPS for your domain, and create the owner account.
order: 2
---

# Install with Docker

Feedback Pilgrim runs in one container. The container serves the app, runs the queue worker and the scheduler, and keeps all the data in one volume at `/data`. The default database is SQLite. You need no `.env` file.

## Try it on your computer

```bash
docker run -d --name feedbackpilgrim -p 8080:8080 -v feedbackpilgrim:/data ghcr.io/amedina068/feedbackpilgrim
docker logs -f feedbackpilgrim
```

The last line of the log is the setup URL, for example `http://localhost:8080/setup?token=...`. Open it, then create the owner account and the first project.

The public site of a project is at `http://<subdomain>.localhost:8080`. Browsers send `*.localhost` to your own computer, so you need no DNS record.

## Install on a server

You need:

- A Linux server with Docker, on amd64 or arm64. 1 GB of memory is enough.
- Ports 80 and 443 open to the internet.
- A domain for the dashboard, for example `feedback.example.com`.

1. Add two DNS A records that point to the IP address of the server:

   | Name | What it serves |
   |---|---|
   | `feedback.example.com` | The dashboard, the REST API, the MCP server and `pilgrim.js` |
   | `*.feedback.example.com` | The public site of each project |

2. Run the installer on the server:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/amedina068/feedbackpilgrim/main/install.sh | bash
   ```

3. Type the domain when the installer asks for it.
4. Open the setup URL that the installer shows.
5. Create the owner account and the first project. Then the app signs you in.

The installer checks Docker, the CPU architecture and the ports. It starts the container, waits until the app answers, and shows the setup URL. It writes a log to `/tmp/feedbackpilgrim-install.log`.

| Option | What it does |
|---|---|
| `--domain=<host>` | Uses this domain. The installer does not ask. |
| `--non-interactive` | Asks nothing. The installer reads the domain from `APP_DOMAIN`. |
| `--dry-run` | Prints each docker command. The installer changes nothing. |

To pass an option through `curl`, use `bash -s --`, for example `curl -fsSL <url> | bash -s -- --dry-run`.

## Start the container without the installer

```bash
docker run -d --name feedbackpilgrim --restart unless-stopped \
  -p 80:80 -p 443:443 -p 443:443/udp \
  -e APP_DOMAIN=feedback.example.com \
  -v feedbackpilgrim:/data \
  ghcr.io/amedina068/feedbackpilgrim
```

When `APP_DOMAIN` is set, the container serves ports 80 and 443 with automatic HTTPS. Read [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md).

The image tag `latest` is the latest release. To stay on one version, use a version tag, for example `ghcr.io/amedina068/feedbackpilgrim:0.1.0`.

## The setup URL

The setup page at `/setup` creates the owner account and the first project. It is open only while the instance has no user.

The setup URL holds a token. The app makes the token from `APP_KEY` with HMAC-SHA256, so the instance stores no token. If you open `/setup` without the correct token, the page shows no form. It shows the commands that print the setup URL, and a field for the token.

If you lose the setup URL, show it again:

```bash
docker exec feedbackpilgrim php artisan fp:setup-url
```

After the first user exists, `/setup` sends you to the login page.

## Create the owner from the command line

An agent or a script can create the owner without the setup page:

```bash
docker exec feedbackpilgrim php artisan fp:install \
  --name="Ada Lovelace" --email=ada@example.com \
  --project="Acme" --subdomain=acme \
  --json --no-interaction
```

The command returns a one-time `login_url`. With `--with-token=<name>`, it also makes an API token and returns the commands that connect an AI agent. A second run makes no change and returns `"status":"exists"`. Read [Accounts and registration](../self-hosting/accounts-and-registration.md).

## What the container does at start

1. On the first start, it makes `APP_KEY` and the other secrets. It writes them to a file in `/data` with mode 600. On each later start, it reads the same file.
2. It runs the migrations.
3. It starts the web server, the queue worker and the scheduler.
4. If no account exists, it prints the setup URL as the last line of the log. If an owner exists, it prints the app URL.

The Docker health check calls `/up`.

## The `/data` volume

The volume holds all the data of the instance:

- the SQLite database
- the generated secrets, with `APP_KEY`
- the uploads: post attachments, comment photos, avatars and logos
- the TLS certificates

WARNING: Back up the `/data` volume. If you lose it, you lose `APP_KEY`, and a restored database cannot decrypt the identity secrets of the projects. Read [Backups](../self-hosting/backups.md).

## Environment variables

On localhost, the container needs no variable. On a server, `APP_DOMAIN` is the only required variable. The app derives `APP_URL`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` and `SESSION_SECURE_COOKIE` from it.

To set more values, add `-e NAME=value` to `docker run`, or use `--env-file`. Read [Configuration](configuration.md) for all the variables, and [Mail](../self-hosting/mail.md) for the mail server.

## MySQL and Redis

The repository has a `docker-compose.yml` for MySQL 8.4 and Redis 7.4. Use it if you already run MySQL, or if you want the database in a separate container.

1. Clone the repository and go into its folder:

   ```bash
   git clone https://github.com/amedina068/feedbackpilgrim.git
   cd feedbackpilgrim
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. In `.env`, set `APP_DOMAIN` and `DB_PASSWORD`.
4. In `.env`, remove the `#` from the lines of the "MySQL and Redis" block. The block sets `COMPOSE_PROFILES=mysql`, so Compose also starts the `mysql` and `redis` services.
5. Build and start the stack:

   ```bash
   docker compose up -d --build
   ```

6. Read the setup URL on the last line of the log:

   ```bash
   docker compose logs -f web
   ```

Without step 4, the same Compose file runs the `web` service with SQLite. The `web` service runs the app, the queue worker and the scheduler. A fresh MySQL install loads a schema dump, so the first start is fast. The `web` service waits for MySQL before it runs the migrations.

The Compose file publishes port 8080 on `127.0.0.1` and expects your own proxy with TLS. To let the container get its own certificates, set `CADDY_ENABLED=true` and publish ports 80 and 443. To use the published image instead of a local build, use `docker compose -f docker-compose.image.yml`.

## Next steps

- [Configuration](configuration.md)
- [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md)
- [Backups](../self-hosting/backups.md)
- [Upgrading](upgrading.md)
- [Connect an AI agent](../mcp/connecting-clients.md)
