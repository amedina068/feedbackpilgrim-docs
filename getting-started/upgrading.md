---
title: Upgrading
description: Update an instance to a new version of the code, and the steps for instances made with older code.
order: 5
---

# Upgrading

Only the latest release gets security fixes. The changelog of the app repository lists the changes and the breaking changes of each version. Read it before you upgrade. The [release notes](release-notes.md) list the changes that users can see, by date.

You can skip versions, for example from `0.1.0` to `0.3.0`. `php artisan migrate` runs all the migrations that the instance does not have, in order. Read the changelog of each version that you skip, because a version can have a manual step.

Make a backup before you upgrade. Read [Backups](../self-hosting/backups.md).

## Upgrade with Docker

1. Get the new code:

   ```bash
   git pull
   ```

2. Build the image and start the stack again:

   ```bash
   docker compose up -d --build
   ```

The `web` service runs the new migrations when it starts. The `queue` and `scheduler` services start again after `web` is healthy.

## Upgrade with the published image

1. If `.env` sets `FEEDBACKPILGRIM_VERSION`, change it to the new version.
2. Get the new image:

   ```bash
   docker compose -f docker-compose.image.yml pull
   ```

3. Start the stack again:

   ```bash
   docker compose -f docker-compose.image.yml up -d
   ```

## Upgrade without Docker

1. Get the new code:

   ```bash
   git pull
   ```

2. Install the PHP packages:

   ```bash
   composer install --no-dev --optimize-autoloader
   ```

3. Build the assets and the widget:

   ```bash
   npm ci
   npm run build
   ```

4. Run the new migrations:

   ```bash
   php artisan migrate --force
   ```

5. Cache the configuration, the routes and the views again:

   ```bash
   php artisan optimize
   ```

6. Restart the queue worker:

   ```bash
   php artisan queue:restart
   ```

## If an upgrade fails

Restore the backup that you made before the upgrade. Do not use `php artisan migrate:rollback`. Some migrations change or remove data, and their `down` method cannot bring the data back. For example, the migration that adds the unique index of the votes removes the duplicate votes.

1. Stop the queue worker and the scheduler.
2. Go back to the old version of the code or the image.
3. Restore the database, `storage/app` and `.env` from the backup. Read [Backups](../self-hosting/backups.md).
4. Start the app again.

## Instances made with older code

These notes apply to an instance that existed before some changes in the code.

### The owner flag

The migration `2026_11_17_000100_add_is_owner_to_users_table` makes the first user (the lowest id) the owner. If that user is not the person who runs the instance, make the correct user an owner:

```bash
php artisan fp:install --promote=person@example.com
```

### The old billing step

The migration `2026_11_16_000001_complete_pricing_onboarding` moves users from the old `pricing` onboarding step to `completed`. Feedback Pilgrim has no billing now. An instance that ran the old billing migrations keeps the unused `subscriptions` tables and the billing columns of `users`.

### Identity verification of the widget

A new project requires identity verification of the widget. A project that existed before this setting does not require it. Read [The embeddable widget](../using-feedback-pilgrim/widget.md#identity-verification).

### The old widget key

The widget sends the publishable key (`pk_...`) of the project. The app accepts only this key. A host app that still sends the old public widget token gets `401` with the error `Invalid client key`, and the widget does not load.

CAUTION: Update each host app before you upgrade. Put the publishable key from **Settings > Embed Widget** in the `data-client` attribute of the script tag.

### The testimonial rating setting

The app creates the testimonial settings for each new project. To create the rating setting for projects that do not have it, run:

```bash
php artisan setup:testimonial-rating-settings
```

### The custom attributes of contacts

The app makes the list of custom attributes from the metadata of the contacts. To make the list again from all the contacts, run:

```bash
php artisan fp:sync-contact-attributes
```
