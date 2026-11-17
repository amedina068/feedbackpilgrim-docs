---
title: Queues and the scheduler
description: Run the queue worker and the scheduler, and handle failed jobs.
order: 3
---

# Queues and the scheduler

Feedback Pilgrim needs two processes in addition to the web server:

| Process | Command | Docker service |
|---|---|---|
| Queue worker | `php artisan queue:work --tries=3` | `queue` |
| Scheduler | `php artisan schedule:work` | `scheduler` |

## What the queue runs

`QUEUE_CONNECTION` is `redis` in `.env.example`. The worker runs these jobs:

| Job | What it does | Tries |
|---|---|---|
| Notifications | All the emails to contacts and users. Read [Notifications and weekly reports](../using-feedback-pilgrim/notifications-and-weekly-reports.md). | 3 (from `--tries=3`) |
| `DeliverWebhook` | Sends one webhook event. | 3, with a wait of 10 seconds, then 60 seconds |
| `SendSlackMessage` | Posts one Slack message. | 3, with a wait of 10 seconds, then 60 seconds |
| `SyncContactAttributes` | Adds the new custom attribute keys of a contact to the attribute list of the project. | 3 (from `--tries=3`) |

If the worker stops, the app keeps the jobs in Redis. The emails, the webhooks and the Slack messages go out when the worker starts again.

The testimonial request email does not use the queue. The app sends it during the request that moves the post to a `complete` stage.

## The scheduler

The scheduler has one task:

| Task | When |
|---|---|
| `php artisan fp:weekly` | Every Monday at 09:00 UTC |

To see the tasks and the next run, run:

```bash
php artisan schedule:list
```

## Run the processes without Docker

1. Run `php artisan queue:work --tries=3` with a process manager, for example systemd or Supervisor. Restart it if it stops.
2. Add a cron entry that runs the scheduler each minute:

   ```text
   * * * * * cd /path/to/feedback-pilgrim-dashboard && php artisan schedule:run >> /dev/null 2>&1
   ```

3. After each deploy, restart the worker:

   ```bash
   php artisan queue:restart
   ```

The repository has no configuration file for a process manager.

## Health checks in Docker

The `queue` service uses the health check `healthcheck-queue`. The `scheduler` service uses `healthcheck-schedule`. Both come from the base image. The two services start after `web` is healthy.

To read the log of a service:

```bash
docker compose logs queue
docker compose logs scheduler
```

## Failed jobs

A job that fails all its tries goes to the `failed_jobs` table.

To list the failed jobs, run:

```bash
php artisan queue:failed
```

To try all of them again, run:

```bash
php artisan queue:retry all
```

With Docker, run the commands in the `web` service, for example `docker compose exec web php artisan queue:failed`.

A webhook delivery that fails also shows in the delivery log on **Settings > Webhooks**.
