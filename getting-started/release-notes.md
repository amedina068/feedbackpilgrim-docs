---
title: Release notes
description: The changes to Feedback Pilgrim that users can see, newest first.
order: 6
---

# Release notes

This page lists the changes to Feedback Pilgrim that users can see. The newest date is first. Each date is the day that the change merged into the `main` branch of the app (UTC).

This page is about the Feedback Pilgrim app itself. To publish the release notes of your own project, read [Release notes](../using-feedback-pilgrim/release-notes.md).

The release notes have no version numbers. For developers, `CHANGELOG.md` in the [app repository](https://github.com/amedina068/feedbackpilgrim/blob/main/CHANGELOG.md) lists the changes to the code for each version.

## November 24, 2026

- A **Settings > Email** page. A project can send the emails to its contacts from its own domain through Amazon SES. The page shows the DNS records, and the app checks a pending domain every 10 minutes. Until SES verifies the domain, the emails come from `MAIL_FROM_ADDRESS`. Read [Send email from your domain](../using-feedback-pilgrim/sending-domain.md).
- The new `AWS_SES_*` values are optional. If one is empty, the app uses the matching `AWS_*` value. Read [Mail](../self-hosting/mail.md#amazon-ses).
- An **Import** button on the **Testimonials** page. It imports a CSV export from Senja. Each row with text becomes an approved testimonial. Read [Testimonials](../using-feedback-pilgrim/testimonials.md#import-testimonials-from-senja).
- The public site and the dashboard have a new layout, new menus and new empty states. The pages, the fields and the texts stay the same. The mobile menus and the filter panels close on Escape.
- The `LICENSE` file. Feedback Pilgrim is under the GNU Affero General Public License version 3 (AGPL-3.0).
- Example files in `deploy/` for an install without Docker: NGINX, Caddy, systemd and Supervisor. An NGINX example for a proxy in front of the Docker stack.
- The default image in `docker-compose.image.yml` is `ghcr.io/amedina068/feedbackpilgrim`.
- The **Delete Account** button on the profile page opened nothing. It now opens the dialog that asks for the password.
- The "Saved." message on the profile page stayed on the page. It now goes away after two seconds.

## November 18, 2026

- The OpenAPI spec in `docs/api/openapi.yaml`, with the widget `init` call and the key that each operation needs. A Postman collection and environment are in `docs/api/`.
- Each webhook request has `X-FeedbackPilgrim-Timestamp` and `X-FeedbackPilgrim-Signature-V2`, an HMAC-SHA256 of `timestamp.body`. Receivers can reject an old or replayed request.
- Each webhook request has an `X-FeedbackPilgrim-Delivery` ID. Each retry sends the same ID.
- An edit page for a release note in the dashboard. Before, the **Edit** link returned 404.
- A **Settings > Project** page to change the name, the website and the logo of a project.
- A **New project** item in the project selector. It opens the form for a new project.
- Rename and delete a tag on its page in the dashboard. A delete removes the tag from posts, contacts and release notes.
- The Compose files publish the port of the `web` service on `127.0.0.1` by default. Set `APP_BIND=0.0.0.0` to accept traffic from other hosts.
- The Postman link on the API Tokens settings page downloads the collection that the spec makes (`/documentation/postman/download`). The old hand-made collection in `public/` is removed.
- `published_at` is the only publication switch of a release note. **Publish** sets the date if it is empty, and **Unpublish** clears it. The create form has no status field. Leave the date empty to save a draft. A migration copies the old status into `published_at` and removes the `status` column.
- The release note operations of the REST API and the MCP server accept `published` (boolean). The responses have no `status` field.
- A status change from the REST API or the MCP server now sends the same emails, webhooks and Slack message as a stage change in the dashboard.
- Removed: the lookup of the `custom_domain` client setting. Nothing in the app set it, and custom domains are not supported. A host outside `APP_DOMAIN` gets 404.
- Deprecated: the `X-FeedbackPilgrim-Signature` webhook header signs the body only. The next release removes it. Verify `X-FeedbackPilgrim-Signature-V2` instead.
- The API reference showed the wrong pagination fields. It now shows the Laravel paginator that the API returns.
- `GET /api/public/v1/testimonials?approved=false` returned the approved testimonials. It now returns the pending testimonials.
- The testimonial list of the REST API and the MCP server had no order without `sort_by`. It now lists the newest testimonials first.
- The widget `init` call returned 500 when `releaseNotes` had no `show` key. `show` is now optional.
- The widget never opened the newest release note by itself. The init call checked the note two times, and the second check always said "seen". The widget now opens a new note one time for each contact.
- **Unarchive** in the dashboard changed the first post of the project, not the post on the page. It now changes the post on the page.
- The **Publish** and **Unpublish** buttons of a release note returned 500. They now publish and unpublish the note, with a correct message.
- A tag delete from the REST API or the MCP server kept the links from the tag to release notes. It now removes them, as the spec says.
- The weekly report of Monday 09:00 covered the week that started on the same day, so it held only nine hours. It now covers the previous week, Monday to Sunday.
- `GET /posts?sort_by=<unknown value>` on the public site returned 500, and the value went into the SQL `ORDER BY`. The page now accepts only its four sorts. Another value shows the newest posts.
- The project form refused an empty website, because the `domain` rule referred to itself. An empty website now removes the "Back to" link of the public site.
- After an `APP_KEY` change, the widget settings page, the **Regenerate secret** button and each widget `init` call with a `userHash` returned 500. The page now says that the app cannot read the secret, the button makes a new secret, and the widget refuses the hash with 403.
- Feedback Pilgrim loads no analytics script on its pages. The app sends no page views to an outside service.
- A post on a private board no longer shows on the public site, and its URL gets 404. Contacts cannot vote for or comment on a post on a private board or on a draft post. To show a board, mark it public on the Boards page.
- The URL of a draft release note gets 404.
- A webhook URL must use https and point to a public address. An existing webhook with an http URL or a private address stops. Change it to a public https URL.
- A webhook endpoint that answers with a redirect now fails. Enter the final URL of the endpoint.
- A contact has one vote for each item. The update removes duplicate votes, so some vote counts go down.
- The public site and the widget limit the posts, comments, testimonials and votes of each contact and of each IP address. Over the limit, the app answers 429.
- The REST API allows 120 requests each minute for each user or IP address. Before, it allowed 1000.
- The widget `init` call accepts only a publishable key that starts with `pk_`. Another value gets 401.
- Identity verification matches an email only when it is the same after the app removes spaces and changes it to lowercase. An email that differs only by an accent makes a new contact.
- A new project logo gets a random file name and a new URL.
- If an owner removes a user from a project, the dashboard of that user opens the next project of the user.

## November 17, 2026

- Billing is removed. Onboarding has no pricing step, and it goes to the dashboard.
- Registration is off by default. Set `REGISTRATION_ENABLED=true` to turn it on. A password for a new account must have 8 characters or more.
- A new instance opens a setup page. The page creates the owner, the first project and the admin contact. `php artisan fp:setup-url` prints its URL.
- `php artisan fp:install` creates the owner, the first project and the admin contact from the command line. It runs only on an empty database.
- The owner has an admin area at `/admin`. It lists the users, and it can deactivate and reactivate a user. It also sets the registration mode, open or closed.
- A deactivated user cannot sign in, and the API tokens of the user stop working. The data of the user stays.
- `php artisan fp:user:list` lists the users. `php artisan fp:user:password` sets a new password for a user.
- Feedback Pilgrim runs with Docker Compose: the web server, the queue worker, the scheduler, MySQL and Redis.
- The release notes widget shows the name of its own project. Before, it showed the same name for every project.
- The dashboard runs on the host of `APP_URL`. The public sites of the projects stay on subdomains of `APP_DOMAIN`.
- A new project cannot use a reserved subdomain, for example `admin`, `api`, `app` or `www`.
- Contact sign-in links now expire. A link on a page works for 24 hours, and a link in an email works for 7 days. An older link opens the public board without a sign-in.
- Without a `userHash`, the widget signs in only a new contact. For a returning contact, it opens the public board without a sign-in. To sign in returning users, send a `userHash`.
- An API token works only when its user is a member of the project of the token. Other tokens get 401 on the REST API and the MCP server.
- A Markdown link with an unsafe scheme, for example `javascript:`, shows as text.
- Post attachments and comment photos get a random file name with the extension of their file type. The pages show the original name.
- The testimonial widget takes the contact from a signed token. Without a valid token, the testimonial is anonymous. Each IP address can send 5 testimonials each minute.

## November 16, 2026

- The widget uses a publishable key that starts with `pk_`. The embed snippet has no API token. **Settings > Embed Widget** shows the key, the snippet and the identity secret.
- The widget `init` call accepts a `userHash`, an HMAC-SHA256 of the email of the user. A wrong hash gets 403. New projects require the hash.
- The old values of the embed snippet no longer work as tokens for the REST API and the MCP server. The widget accepted them until November 18, 2026.
- The widget `init` call without a contact email now returns 422 with an error message. Before, it returned 500.
- `pilgrim.js` sends its requests to the host that served the script. One build of the script works on more than one host.

## September 25, 2026

- Feedback Pilgrim can send email through Amazon SES. Set `MAIL_MAILER=ses`, then set the AWS access key, the secret key and the region.

## September 10, 2026

- The MCP server has a new tool, `create_post_comment`. It adds a comment to a post as the user of the API token. The author of the post gets an email.

## June 16, 2026

- The project logo upload accepts JPG, PNG, GIF and WebP files. It refuses SVG files. SVG logos that are already stored still show.

## February 11, 2026

- A REST API for posts, contacts, release notes, tags and testimonials. Make an API key in the settings to use it.

## August 7, 2025

- When a post moves to completed, Feedback Pilgrim can ask the author of the post for a testimonial by email. Turn on the testimonial automation in the settings, and write the text of the email. A contact who already gave a testimonial gets no email.

## Version 0.1.0

Version 0.1.0 is the first public release. It has no release date yet. `CHANGELOG.md` lists these features for it:

- Feedback boards with posts, votes, comments, tags and stages. A project can have more than one board.
- A public site for each project on its own subdomain, with the posts, the roadmap, the release notes and the testimonials.
- Revenue weighting: the MRR and the LTV of each contact, and a sort of the requests by revenue.
- Release notes, and a notification to the voters when a request ships.
- Testimonials with a rating, and an approval step before a testimonial shows.
- An embeddable widget (`pilgrim.js`) that signs in the users of your app with a publishable key and an HMAC `userHash`.
- A versioned REST API with an OpenAPI document and a Postman collection.
- An MCP server for AI agents, with tools for posts, comments, release notes, contacts, testimonials and tags.
- Signed webhooks and Slack messages.
- A weekly report (`fp:weekly`) that the scheduler starts each Monday.
- Self-hosting with Docker Compose: web, queue worker, scheduler, MySQL and Redis.
- A Docker image on GHCR for each release, for `linux/amd64` and `linux/arm64`, and `docker-compose.image.yml` to run it without a build.
- A first-run setup page and the `fp:install` command to create the owner of the instance.
- Open and closed registration modes, an owner role, user deactivation and account recovery commands (`fp:user:list`, `fp:user:password`).
- Optional Mailgun, Amazon SES and Rollbar.
