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
| `--project` | The name of the first project. 255 characters or fewer. |
| `--subdomain` | The subdomain of the first project. Lowercase letters, digits and single hyphens. Not reserved, unique. |

The command needs no password. It shows a login link that works one time, for 60 minutes. After the login, the owner can set a password on the profile page. The old options `--password` and `--client-name` still work, but they are deprecated.

If the instance has an owner with the same email, the command changes nothing, shows a new login link and exits with code 0. If the instance has users but this email is not an owner, the command stops with the error code `instance_has_owner` and exits with code 3.

At the end, the command shows the URL of the dashboard and of the public site.

For a script or an AI agent, add `--json --no-interaction`. With `--json`, the command prints one JSON object with a one-time `login_url`. With `--with-token=<name>`, it also makes an API token and returns the `claude mcp add` and `codex mcp add` commands. In this mode, a second run makes no change, returns `"status":"exists"` and exits with code 0. Read the `INSTALL.md` file of the app repository for the full agent procedure.

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
docker exec feedbackpilgrim php artisan fp:install --promote=person@example.com
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
