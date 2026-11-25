---
title: Backups
description: What to back up on a Feedback Pilgrim instance, and how to back up and restore the /data volume or the MySQL stack.
order: 2
---

# Backups

Feedback Pilgrim does not make backups by itself. Make them with the tools of your server.

Back up the database and the uploads each day. Keep the daily backups for 14 days. Also make a backup before each upgrade. Copy the backups to storage outside the server. Restore a backup to a test server one time each month, to make sure that the backups work.

## What to back up

With the default Docker install, back up one item: the `/data` volume. It holds the SQLite database, the generated secrets with `APP_KEY`, the uploads and the TLS certificates.

With MySQL or without Docker, back up these items:

| Item | Where | Why |
|---|---|---|
| The database | MySQL. The `mysql` volume with Docker. | All the records: users, projects, posts, contacts, tokens and settings. |
| The uploads | `storage/app`. The `storage` volume with Docker. | Post attachments, comment photos, avatars and logos. |
| `.env` | The folder of the repository | `APP_KEY` and the other secrets. |

WARNING: Back up `APP_KEY` with the database. The app encrypts the identity secret of each project with `APP_KEY`. Without the same key, a restored database cannot decrypt the identity secrets, and the widget cannot verify the users.

Redis holds the cache, the sessions, the queued jobs and the last-login times of the contacts. If you lose Redis, the users must sign in again, and the queued jobs that did not run are lost. The `redis` volume keeps the data on disk.

## Back up the `/data` volume

These commands stop the container for a few seconds. A stopped container makes a consistent copy of the SQLite database.

1. Stop the container:

   ```bash
   docker stop feedbackpilgrim
   ```

2. Copy the volume to a file in the current folder:

   ```bash
   docker run --rm -v feedbackpilgrim:/data -v "$PWD":/backup alpine \
     tar czf /backup/feedbackpilgrim-$(date +%F).tar.gz -C /data .
   ```

3. Start the container:

   ```bash
   docker start feedbackpilgrim
   ```

4. Move the file to storage outside the server.

## Restore the `/data` volume

1. Remove the container and the volume:

   ```bash
   docker rm -f feedbackpilgrim
   docker volume rm feedbackpilgrim
   ```

2. Copy the backup into a new volume:

   ```bash
   docker run --rm -v feedbackpilgrim:/data -v "$PWD":/backup alpine \
     tar xzf /backup/feedbackpilgrim-2026-11-25.tar.gz -C /data
   ```

3. Start the container with the same command as before. The container reads `APP_KEY` from the volume.

## Back up the Compose stack with MySQL

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

## Restore the Compose stack with MySQL

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
