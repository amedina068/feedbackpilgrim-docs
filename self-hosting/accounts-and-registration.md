---
title: Accounts and registration
description: Create the owner, make a user an owner, and choose who can sign up on the instance.
order: 5
---

# Accounts and registration

## The owner

An owner runs the instance. Only an owner sees the **Admin** link and can open `/admin`. Other users get 404 there. Read [The admin area](../using-feedback-pilgrim/admin-area.md).

An instance can have more than one owner. Nobody can deactivate an owner.

## Create the first owner

On an empty instance, two ways create the owner, the first project and the admin contact of the owner:

- The setup page at `/setup`. Read [Install with Docker](../getting-started/installation-docker.md#the-setup-url).
- The command `php artisan fp:install`.

Both ways mark the email of the owner as verified, and finish the onboarding.

### The `fp:install` command

```bash
php artisan fp:install
```

The command asks for each value that you do not give as an option:

| Option | Rules |
|---|---|
| `--name` | Required, 255 characters or fewer |
| `--email` | Required, a lowercase email, unique |
| `--password` | Required, 8 characters or more |
| `--client-name` | The name of the first project. Required, 255 characters or fewer. |
| `--subdomain` | The subdomain of the first project. Lowercase letters, digits and single hyphens. Not reserved, unique. |

If the command cannot prompt, for example with `--no-interaction`, give all the options.

The command stops with an error if the instance has a user already: `This instance already has users. fp:install only runs on an empty database.`

At the end, the command shows the URL of the dashboard and of the public site.

The command also has two other modes:

| Option | What it does |
|---|---|
| `--prepare` | Creates only the storage link. Creates no account. The Docker image runs this at start. |
| `--promote=<email>` | Makes the existing user with this email an owner. Creates no account. |

## Make a user an owner

```bash
php artisan fp:install --promote=person@example.com
```

With Docker:

```bash
docker compose exec web php artisan fp:install --promote=person@example.com
```

## Registration modes

The instance has two registration modes:

| Mode | Effect |
|---|---|
| Closed | Nobody can sign up. `/register` returns 404. This is the default. |
| Open | Anyone can sign up at `/register`. A new user then creates a project. |

`REGISTRATION_ENABLED` gives the mode until the owner sets one:

- `REGISTRATION_ENABLED=false` gives the closed mode.
- `REGISTRATION_ENABLED=true` gives the open mode.

To change the mode, open **Admin > Settings**. The mode that the owner saves stays in the `instance_settings` table. It wins over `REGISTRATION_ENABLED`.

## Invitations

Feedback Pilgrim has no invitations. On a closed instance, only the setup page and `fp:install` create accounts. No screen adds a user to an existing project.

## Email verification

The app has the email verification routes of Laravel Breeze, but no page requires a verified email.
