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

The scheduler has two tasks:

| Task | When |
|---|---|
| `php artisan fp:weekly` | Every Monday at 09:00 UTC |
| `php artisan sending-domains:check` | Every 10 minutes |

`sending-domains:check` asks SES for the status of each pending sending domain. It also checks each verified domain again one time each day. It does not check a failed domain. Read [Send email from your domain](../using-feedback-pilgrim/sending-domain.md).

To see the tasks and the next run, run:

```bash
php artisan schedule:list
```

## Run the processes without Docker

1. Run `php artisan queue:work --tries=3` with a process manager, for example systemd or Supervisor. Restart it if it stops.
2. Run the scheduler. Use `php artisan schedule:work` with the process manager, or add a cron entry that runs the scheduler each minute:

   ```text
   * * * * * cd /var/www/feedbackpilgrim && php artisan schedule:run >> /dev/null 2>&1
   ```

3. After each deploy, restart the worker:

   ```bash
   php artisan queue:restart
   ```

The [`deploy/`](https://github.com/amedina068/feedbackpilgrim/tree/main/deploy) folder of the app repository has example files for the two processes. Use the systemd units or the Supervisor file, not both:

- [`systemd/feedbackpilgrim-queue.service`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/systemd/feedbackpilgrim-queue.service)
- [`systemd/feedbackpilgrim-scheduler.service`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/systemd/feedbackpilgrim-scheduler.service)
- [`supervisor/feedbackpilgrim.conf`](https://github.com/amedina068/feedbackpilgrim/blob/main/deploy/supervisor/feedbackpilgrim.conf)

The app has one queue, `default`, on the `redis` connection. Run one worker. A job has 60 seconds, the default `--timeout` of `queue:work`. The examples give a stopped worker 70 seconds to finish its job.

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
