---
title: Install without Docker
description: Install Feedback Pilgrim on a server with PHP, MySQL and Redis, without Docker.
order: 3
---

# Install without Docker

This page installs Feedback Pilgrim on a Linux server with PHP, a web server, MySQL and Redis. The Docker files of the repository show the same steps. Read [Install with Docker](installation-docker.md) for the Docker way.

## Requirements

| Item | Version or detail |
|---|---|
| PHP | 8.3 or later (`composer.json` requires `^8.3`) |
| PHP extensions | `pdo_mysql`, `redis`, `gd`, `exif`, `pcntl`, `opcache` and `zip`. The Docker image has these extensions. |
| Composer | 2 |
| Node.js | 24, to build the assets. The server does not need Node.js after the build. |
| MySQL | The Docker stack uses MySQL 8.4. |
| Redis | The Docker stack uses Redis 7.4. |
| A web server | Its document root must be the `public/` folder. |

Redis is necessary. The example environment uses Redis for the cache, the sessions and the queue. The widget also stores the last-login time of each contact in Redis directly.

The app uses the `phpredis` client (`REDIS_CLIENT=phpredis`), so PHP needs the `redis` extension.

TODO(owner): The repository has a web server configuration only inside the Docker image. Do you want to publish an example NGINX or Caddy configuration for an install without Docker?

## Install

1. Clone the repository and go into its folder:

   ```bash
   git clone https://github.com/amedina068/feedback-pilgrim-dashboard.git
   cd feedback-pilgrim-dashboard
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

9. Configure the web server. Send the dashboard domain and the wildcard of the projects to `public/index.php`.
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
