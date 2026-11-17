---
title: Upgrading
description: Update an instance to a new version of the code, and the steps for instances made with older code.
order: 5
---

# Upgrading

TODO(owner): The `main` branch has no version tags and no changelog. Which versions do you support, and can an instance skip versions when it upgrades?

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

TODO(owner): The code has no rollback procedure. If an upgrade fails, do you recommend a restore from the backup, or `php artisan migrate:rollback`?

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

The widget now sends the publishable key (`pk_...`) of the project. For a short time, the app also accepts the old public widget token of a project. The app writes a warning to the log each time that a host app uses the old token.

If the log shows `Embed widget used a deprecated legacy client key`, update the `data-client` attribute of the script tag in that host app. Use the publishable key from **Settings > Embed Widget**.

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
