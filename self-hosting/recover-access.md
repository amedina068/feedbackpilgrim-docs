---
title: Recover access
description: Set a new password without email, find a lost setup URL, and restore an owner.
order: 6
---

# Recover access

The "forgot password" form sends an email. If the instance has no mail, or if a user cannot read the email, use the commands on this page.

With Docker, put `docker compose exec web` before each command, for example `docker compose exec web php artisan fp:user:list`.

## Find a user

```bash
php artisan fp:user:list --search=person
```

The command lists the users with these columns: ID, name, email, projects, owner, status (`active` or `deactivated`) and the date of creation. `--search` finds the text in the name or the email. Without `--search`, the command lists all the users.

## Set a new password

```bash
php artisan fp:user:password person@example.com
```

The command asks for the new password two times.

| Option | What it does |
|---|---|
| `--password=<new password>` | Sets this password, without a prompt. Use it in a script. |
| `--generate` | Makes a random password of 32 letters and digits, and shows it one time. |

You cannot use `--password` and `--generate` together. If the command cannot prompt, give one of them.

The new password must obey the same rules as the web forms.

After the change, the command:

- ends all the "Remember me" logins of the user,
- removes the web sessions of the user, if `SESSION_DRIVER` is `database`.

With the `redis` session driver, the command cannot find the sessions of one user. An open web session stays open until it expires (`SESSION_LIFETIME`) or the user logs out.

WARNING: The command shows a generated password in the terminal. Copy it at once, and clear the terminal history if other people can read it.

## Lost setup URL

While the instance has no user, show the setup URL again:

```bash
php artisan fp:setup-url
```

If a user exists, the command says `An account already exists. The setup page is closed.`

## No owner can sign in

Make another user an owner:

```bash
php artisan fp:install --promote=person@example.com
```

Then set a password for that user with `fp:user:password` if necessary.

## A deactivated user

An owner can reactivate a user in **Admin > Users**. Read [The admin area](../using-feedback-pilgrim/admin-area.md#deactivate-a-user).

## Two-factor authentication

Feedback Pilgrim has no two-factor authentication. Thus no reset of a second factor is necessary.

## A lost `APP_KEY`

If you lose `APP_KEY`, and you set a new key:

- The setup URL changes.
- The sign-in links that the app sent to contacts stop working.
- The app cannot decrypt the identity secret of each project. The widget then refuses each `userHash` with 403.
- The users must sign in again.

To make a new identity secret after a key change, do these steps in each project:

1. Sign in as a user of the project.
2. Open **Settings > Embed Widget**. The page says that the app cannot read the identity secret.
3. Click **Regenerate secret**.
4. Put the new secret in the server of your app.

No command makes new secrets for all projects together.

To prevent this, back up `.env`. Read [Backups](backups.md).
