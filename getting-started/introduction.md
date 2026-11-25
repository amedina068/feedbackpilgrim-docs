---
title: Introduction
description: What Feedback Pilgrim is, its features, its parts and stack, the two kinds of accounts, the words of these docs, and the license.
order: 1
---

# Introduction

Feedback Pilgrim is a self-hosted feedback board. Your customers post feature requests, vote and comment on a public site for each of your products. You sort the requests by the revenue of the customers who ask for them.

One instance can hold many projects. Each project has its own public site on a subdomain, for example `acme.feedback.example.com`. The team works in the dashboard on the main domain, for example `feedback.example.com`.

## What you can do

- **Collect feedback.** Contacts post requests, vote and comment on the public site. A contact can attach files to a post and photos to a comment.
- **Organize the work.** Put posts on boards, move them through stages on a kanban board, and add tags. Merge duplicate posts.
- **Weight by revenue.** Send the monthly recurring revenue (MRR) and the lifetime value (LTV) of each contact. The post list can sort by a priority score that adds the MRR of the voters.
- **Show a public roadmap.** The roadmap shows the posts in the stages that you mark for the roadmap.
- **Publish release notes.** Contacts read, vote and comment on them. The widget can open the newest note in your app.
- **Close the loop.** When a post moves to a new stage, the author and the voters get an email.
- **Collect testimonials.** Contacts write testimonials with an optional rating. A testimonial shows on the public site after approval.
- **Embed the widget.** The `pilgrim.js` script signs in the users of your app on the public site, without a second login.
- **Automate.** Use the REST API, the MCP server for AI agents, signed webhooks and Slack messages.
- **Run the instance.** The owner manages the users and the registration mode in the admin area.

## How it works

Feedback Pilgrim is a Laravel 13 app on PHP 8.3, with Blade views, Vue 3 components and Tailwind CSS 4. The main parts are:

| Part | What it does |
|---|---|
| Web app | Serves the dashboard, the public sites, the widget endpoints, the REST API, the MCP server and the guides at `/documentation`. |
| Database | MySQL. The Docker stack uses MySQL 8.4. The tests use SQLite in memory. |
| Redis | Holds the cache, the sessions, the queue and the last-login times of the contacts. |
| Queue worker | Runs `php artisan queue:work`. It sends the emails, the webhooks and the Slack messages. |
| Scheduler | Runs `php artisan schedule:work`. It starts the weekly reports every Monday. |
| File storage | Holds the uploads (attachments, photos, avatars and logos) in `storage/app`. |

Feedback Pilgrim supports MySQL only. Use MySQL 8.4, the version of the Docker stack. The tests use SQLite in memory. Do not use SQLite for an instance. PostgreSQL and MariaDB are not tested and not supported.

## Two kinds of accounts

Feedback Pilgrim has two kinds of accounts:

- A **user** signs in to the dashboard with an email and a password. A user can manage one or more projects.
- A **contact** is a customer of one project. A contact signs in to the public site with a signed link, not with a password.

Each user also has an **admin contact** in each of their projects. The admin contact is the identity of the user on the public site and in the MCP tool `create_post_comment`.

## Words that these docs use

| Word | Meaning |
|---|---|
| Instance | One installation of Feedback Pilgrim. |
| Owner | A user who runs the instance. Only an owner can open `/admin`. |
| Project | One product with its own public site. The code calls a project a "client". |
| Contact | A customer of a project. |
| Post | One piece of feedback, for example a feature request. |
| Board | A group of posts in a project. |
| Stage | One step of the status pipeline of a post. The dashboard calls a stage a "status". |
| Tag | A label for posts, contacts and release notes. |
| Release note | A changelog entry of a project. |
| Testimonial | A text from a customer, with an optional rating. |
| API token | A personal access token for the REST API and the MCP server. Each token belongs to one project. |
| Publishable key | The public `pk_...` key that the widget sends. It gives no API access. |
| Identity secret | The secret that your server uses to sign the email of a user for the widget. |

## License

The app is free software under the GNU Affero General Public License version 3 (AGPL-3.0). The [`LICENSE`](https://github.com/amedina068/feedbackpilgrim/blob/main/LICENSE) file of the app repository has the full text. If you change the code and let other people use your changed copy over a network, you must offer them the source code of your changed copy.

The SDKs are under the MIT license.

## Next steps

- To install with Docker, read [Install with Docker](installation-docker.md).
- To install on a server without Docker, read [Install without Docker](installation-manual.md).
- To set the environment variables, read [Configuration](configuration.md).
