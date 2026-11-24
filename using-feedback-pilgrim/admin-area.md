---
title: The admin area
description: The owner manages the users and the registration mode of the instance in /admin.
order: 13
---

# The admin area

The admin area is at `/admin` on the dashboard host. Only an owner can open it. For other users and for guests, each admin page returns 404. An owner sees the **Admin** link in the sidebar.

Read [Accounts and registration](../self-hosting/accounts-and-registration.md) to make a user an owner.

## Users

Open **Admin > Users** (`/admin/users`). The list shows all the users of the instance, the newest first, 25 on each page. Each row shows the projects of the user. You can search by name or email.

### Deactivate a user

Click **Deactivate** on the row of the user. A deactivated user keeps all their data, but cannot authenticate:

- The login form refuses the user and shows the reason.
- An open web session ends at the next request. A "Remember me" cookie stops working.
- The API tokens of the user stop working. This includes the MCP server.
- The sign-in link of the admin contact of the user returns 404 on the public site.

A project keeps its public site, its iframes and its widget while one of its users is active. When every user of a project is deactivated, these stop too, and the widget gets 401.

To restore access, click **Reactivate**. The tokens of the user work again.

The owner cannot deactivate an owner. The app returns 403 with `You cannot deactivate an owner.`

## Settings

Open **Admin > Settings** (`/admin/settings`). The page has one setting: the registration mode.

| Mode | Effect |
|---|---|
| Closed | Nobody can sign up. `/register` returns 404. |
| Open | Anyone can sign up and create projects. |

The mode that the owner saves stays in the database. It wins over `REGISTRATION_ENABLED`. Read [Accounts and registration](../self-hosting/accounts-and-registration.md).

## Commands for the owner

The owner can also manage users in the terminal:

| Command | What it does |
|---|---|
| `php artisan fp:user:list` | Lists the users, with their projects, owner flag and status. |
| `php artisan fp:user:password` | Sets a new password for a user. |
| `php artisan fp:install --promote=<email>` | Makes an existing user an owner. |

Read [Recover access](../self-hosting/recover-access.md).
