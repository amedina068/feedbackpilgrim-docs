---
title: Install without Docker
description: Install Feedback Pilgrim on a server with PHP and a web server, without Docker. SQLite or MySQL, with or without Redis.
order: 3
---

# Install without Docker

This page installs Feedback Pilgrim on a Linux server with PHP and a web server. The Docker image is faster to install and does these steps for you. Read [Install with Docker](installation-docker.md).

## Requirements

| Item | Version or detail |
|---|---|
| PHP | 8.3 or later (`composer.json` requires `^8.3`) |
| PHP extensions | `pdo_sqlite` or `pdo_mysql`, `gd`, `exif`, `pcntl`, `opcache` and `zip`. Add `redis` if you use Redis. The Docker image has these extensions. |
| Composer | 2 |
| Node.js | 24, to build the assets. The server does not need Node.js after the build. |
| A database | SQLite 3, or MySQL 8.4. For SQLite, the `sqlite3` binary must also be installed. |
| Redis | Optional. The Compose stack uses Redis 7.4. |
| A web server | Its document root must be the `public/` folder. |

Without Redis, set `CACHE_DRIVER`, `SESSION_DRIVER` and `QUEUE_CONNECTION` to `database`. With Redis, the app uses the `phpredis` client (`REDIS_CLIENT=phpredis`), so PHP needs the `redis` extension.

The [`deploy/`](https://github.com/amedina068/feedbackpilgrim/tree/main/deploy) folder of the app repository has example files for an install without Docker:

| File | What it is |
|---|---|
| [`nginx/feedbackpilgrim.conf`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/nginx/feedbackpilgrim.conf) | NGINX with PHP-FPM |
| [`caddy/Caddyfile`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/caddy/Caddyfile) | Caddy with PHP-FPM |
| [`systemd/feedbackpilgrim-queue.service`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/systemd/feedbackpilgrim-queue.service) | The queue worker as a systemd service |
| [`systemd/feedbackpilgrim-scheduler.service`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/systemd/feedbackpilgrim-scheduler.service) | The scheduler as a systemd service |
| [`supervisor/feedbackpilgrim.conf`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/supervisor/feedbackpilgrim.conf) | The queue worker and the scheduler as Supervisor programs |

The files use the app folder `/var/www/feedbackpilgrim`, the user `www-data` and the PHP-FPM socket `/run/php/php8.3-fpm.sock`. Replace these values with the values of your server.

## Install

1. Clone the repository and go into its folder:

   ```bash
   git clone https://github.com/amedina068/feedbackpilgrim.git
   cd feedbackpilgrim
   ```

2. Install the PHP packages without the development packages:

   ```bash
   composer install --no-dev --optimize-autoloader
   ```

3. Build the dashboard assets and the widget:

   ```bash
   npm ci
   npm run build
   ```

   The build makes `public/build` and `public/pilgrim.js`.

4. Copy the example environment file and make the app key:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. Set the values in `.env`. Read [Configuration](configuration.md).
6. Create the tables:

   ```bash
   php artisan migrate --force
   ```

7. Create the storage link:

   ```bash
   php artisan fp:install --prepare
   ```

8. Cache the configuration, the routes and the views:

   ```bash
   php artisan optimize
   ```

9. Configure the web server. Send the dashboard domain and the wildcard of the projects to `public/index.php`. Start from the NGINX or the Caddy example above.
10. Give the user of the web server write access to `storage/` and `bootstrap/cache/`.
11. Start the queue worker and the scheduler. Read [Queues and the scheduler](../self-hosting/queues-and-scheduler.md).

## Create the owner

To get the setup URL, run:

```bash
php artisan fp:setup-url
```

Open the URL. Create the owner account and the first project.

To create the owner in the terminal instead, run:

```bash
php artisan fp:install
```

Read [Accounts and registration](../self-hosting/accounts-and-registration.md) for the options of `fp:install`.

## After a change to `.env`

`php artisan optimize` caches the configuration. If you change `.env` after that, the app does not see the change.

1. Run `php artisan optimize` again.
2. Restart the queue worker with `php artisan queue:restart`.

## Next steps

- [Configuration](configuration.md)
- [Reverse proxy and TLS](../self-hosting/reverse-proxy-and-tls.md)
- [Queues and the scheduler](../self-hosting/queues-and-scheduler.md)
