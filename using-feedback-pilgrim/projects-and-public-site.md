---
title: Projects and the public site
description: Create a project, switch between projects, and learn what the public site of a project shows.
order: 1
---

# Projects and the public site

A project is one product with its own public site. The code calls a project a "client". All the data of a project stays in that project: posts, contacts, boards, stages, tags, release notes, testimonials, settings and API tokens.

## Create a project

The setup page and `php artisan fp:install` create the first project of the owner. A new user on an open instance creates a project during onboarding.

To create a project, give:

- a name,
- a subdomain. The subdomain uses lowercase letters, digits and single hyphens, for example `acme`. It must be unique on the instance.

These subdomains are reserved: `admin`, `api`, `app`, `assets`, `blog`, `cdn`, `dashboard`, `dev`, `docs`, `help`, `mail`, `mcp`, `smtp`, `staging`, `static`, `status`, `support` and `www`.

When the app creates a project, it also creates:

- a publishable key and an identity secret for the widget,
- six default stages (read [Stages and the roadmap](stages-and-roadmap.md)),
- one public board with the name `Feature Requests`,
- the testimonial settings: rating off, automation off, and a default email text,
- an admin contact for the user.

A signed-in user can open `/onboarding/project` to create one more project.

TODO(owner): The dashboard has no link to `/onboarding/project` after onboarding. Is this page the supported way for a user to add a second project?

## Switch projects

A user can belong to more than one project. The project selector at the top of the sidebar changes the active project. The dashboard keeps the active project in the session. If the session has no project, the dashboard opens the first project of the user.

Only the code that creates a project adds a user to it. No screen adds a second user to a project.

TODO(owner): The app has no invitations, and no screen adds a user to an existing project. Do you plan team members for a project?

## Rename a project

TODO(owner): The route `PATCH /client` can change the name, the logo and the website domain of a project. But the form `profile/partials/update-client-information-form.blade.php` is not on any page. How does a user rename a project or upload its logo?

The subdomain of a project cannot change after creation. No form or route changes it.

## The public site

The public site of a project is at `https://<subdomain>.<APP_DOMAIN>`, for example `https://acme.feedback.example.com`. The app finds the project from the host name.

| Path | What it shows |
|---|---|
| `/` | The four newest release notes and the five newest published posts. |
| `/posts` | The published posts. A contact can filter by a public board and sort by date or by votes. Completed posts are hidden unless the visitor asks for them. |
| `/posts/{id}` | One published post with its comments and votes. |
| `/roadmap` | The roadmap. Read [Stages and the roadmap](stages-and-roadmap.md#the-public-roadmap). |
| `/release-notes` | The release notes that have a publication date. |
| `/release-notes/{slug}` | One release note. |
| `/testimonials` | The approved testimonials, and the testimonials of the signed-in contact. |

Anyone can read these pages. To post, vote, comment or write a testimonial, a contact must be signed in.

WARNING: The board filter lists only public boards. But without a board filter, `/`, `/posts` and `/roadmap` show the published posts of all boards, also private boards.

TODO(owner): Is it correct that the public site shows the published posts of private boards when the visitor does not choose a board?

If the project has a website domain in its settings, the public site shows a link back to that website.

## How a contact signs in

A contact has no password. A contact signs in with a signed link to `/authenticate/{uuid}`. The link holds an expiry and a signature.

| Link source | Lifetime |
|---|---|
| The widget, the **Public Site** link and **View site as contact** in the dashboard | 24 hours |
| An email to the contact | 7 days |

The app refuses a link with no expiry, a bad signature, or a contact of another project. After the sign-in, the app goes only to a path on the same host. The sign-in link of the admin contact of a deactivated user returns 404.

The public site has no sign-up form for contacts. Contacts come from the widget, the REST API and the MCP server. Read [The embeddable widget](widget.md) and [Contacts and revenue](contacts.md).

## Preview the public site

The **Public Site** link in the sidebar of the dashboard opens the public site of the active project. It signs you in as your admin contact. When you post or comment on the public site, you act as this admin contact.

## Custom domains

The app can find a project from a custom domain instead of a subdomain. It looks for a project setting with the name `custom_domain` and the host as the value.

TODO(owner): No screen or command sets the `custom_domain` setting. Do you support custom domains for the public site, and how does an operator set one?

## Deactivated users

If every user of a project is deactivated, the public site, the iframes and the widget of the project stop. The public site returns 404 and the widget gets 401. A project with one active user, or with no user, keeps them. Read [The admin area](admin-area.md).
