---
title: Backups
description: What to back up on a Feedback Pilgrim instance, and how to back up and restore the Docker stack.
order: 2
---

# Backups

Do not want to run a server? Use [Feedback Pilgrim Cloud](../getting-started/cloud.md).

Feedback Pilgrim does not make backups by itself. Make them with the tools of your server.

Back up the database and the uploads each day. Keep the daily backups for 14 days. Also make a backup before each upgrade. Copy the backups to storage outside the server. Restore a backup to a test server one time each month, to make sure that the backups work.

## What to back up

| Item | Where | Why |
|---|---|---|
| The database | MySQL. The `mysql` volume with Docker. | All the records: users, projects, posts, contacts, tokens and settings. |
| The uploads | `storage/app`. The `storage` volume with Docker. | Post attachments, comment photos, avatars and logos. |
| `.env` | The folder of the repository | `APP_KEY` and the other secrets. |

WARNING: Back up `APP_KEY` with the database. The app encrypts the identity secret of each project with `APP_KEY`. Without the same key, a restored database cannot decrypt the identity secrets, and the widget cannot verify the users.

Redis holds the cache, the sessions, the queued jobs and the last-login times of the contacts. If you lose Redis, the users must sign in again, and the queued jobs that did not run are lost. The `redis` volume keeps the data on disk.

## Back up the Docker stack

Run these commands in the folder of the repository.

1. Export the database:

   ```bash
   docker compose exec -T mysql sh -c 'mysqldump --single-transaction -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > feedbackpilgrim.sql
   ```

2. Copy the uploads:

   ```bash
   docker compose cp web:/var/www/html/storage/app ./storage-app
   ```

3. Copy `.env` to a safe place.
4. Move the three items to storage outside the server.

The `MYSQL_USER`, `MYSQL_PASSWORD` and `MYSQL_DATABASE` variables are set inside the `mysql` container from your `.env`.

## Restore the Docker stack

1. Start the stack with the `.env` from the backup:

   ```bash
   docker compose up -d --build
   ```

2. Import the database:

   ```bash
   docker compose exec -T mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < feedbackpilgrim.sql
   ```

3. Copy the uploads back:

   ```bash
   docker compose cp ./storage-app/. web:/var/www/html/storage/app
   ```

4. Give the files to the `www-data` user. The app runs as this user:

   ```bash
   docker compose exec -u root web chown -R www-data:www-data /var/www/html/storage/app
   ```

5. Restart the app services:

   ```bash
   docker compose restart web queue scheduler
   ```

## Without Docker

Back up the same three items:

- Export the database with `mysqldump`.
- Copy the folder `storage/app`.
- Copy `.env`.

To restore, import the database, copy `storage/app` back, and run `php artisan fp:install --prepare` to create the storage link.
