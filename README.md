# Feedback Pilgrim documentation

This repository holds the documentation of Feedback Pilgrim, a self-hosted feedback board. Customers post feature requests, vote and comment on a public site for each project. The team sorts the requests by the revenue of the customers who ask for them.

Each Markdown file is one page. The folder of a file is the section of the page.

GitHub shows the pages in the public repository [amedina068/feedbackpilgrim-docs](https://github.com/amedina068/feedbackpilgrim-docs). Each instance also serves its own guides at `/documentation`. Those guides are a different set of pages.

The code of the app is in a separate repository, [amedina068/feedbackpilgrim](https://github.com/amedina068/feedbackpilgrim). The docs describe the `main` branch of that code, and the check script compares the pages with it.

## Pages

### Getting started

- [Introduction](getting-started/introduction.md)
- [Install with Docker](getting-started/installation-docker.md)
- [Install without Docker](getting-started/installation-manual.md)
- [Configuration](getting-started/configuration.md)
- [Upgrading](getting-started/upgrading.md)
- [Release notes](getting-started/release-notes.md)

### Using Feedback Pilgrim

- [Projects and the public site](using-feedback-pilgrim/projects-and-public-site.md)
- [Boards](using-feedback-pilgrim/boards.md)
- [Posts, votes and comments](using-feedback-pilgrim/posts-votes-and-comments.md)
- [Stages and the roadmap](using-feedback-pilgrim/stages-and-roadmap.md)
- [Tags](using-feedback-pilgrim/tags.md)
- [Contacts and revenue](using-feedback-pilgrim/contacts.md)
- [Release notes](using-feedback-pilgrim/release-notes.md)
- [Testimonials](using-feedback-pilgrim/testimonials.md)
- [Notifications and weekly reports](using-feedback-pilgrim/notifications-and-weekly-reports.md)
- [Send email from your domain](using-feedback-pilgrim/sending-domain.md)
- [The embeddable widget](using-feedback-pilgrim/widget.md)
- [Webhooks and Slack](using-feedback-pilgrim/webhooks-and-slack.md)
- [The admin area](using-feedback-pilgrim/admin-area.md)

### REST API

- [API overview](api/overview.md)
- [Authentication](api/authentication.md)
- [Init](api/init.md)
- [Posts](api/posts.md)
- [Release notes](api/release-notes.md)
- [Contacts](api/contacts.md)
- [Testimonials](api/testimonials.md)
- [Tags](api/tags.md)
- [OpenAPI and Postman](api/openapi.md)
- [Widget init](api/widget.md)

### SDKs

- [SDKs](sdks/overview.md)

### MCP server

- [MCP server](mcp/overview.md)
- [Connect a client](mcp/connecting-clients.md)
- [MCP tools reference](mcp/tools-reference.md)

### Self-hosting

- [Reverse proxy and TLS](self-hosting/reverse-proxy-and-tls.md)
- [Backups](self-hosting/backups.md)
- [Queues and the scheduler](self-hosting/queues-and-scheduler.md)
- [Mail](self-hosting/mail.md)
- [Accounts and registration](self-hosting/accounts-and-registration.md)
- [Recover access](self-hosting/recover-access.md)
- [Troubleshooting](self-hosting/troubleshooting.md)

### Contributing to the app

- [Architecture](contributing/architecture.md)
- [Development setup](contributing/development-setup.md)
- [Testing](contributing/testing.md)
- [Release process](contributing/release-process.md)

## Write a page

1. Put the page in the folder of its section.
2. Give the file a short name in kebab case, for example `webhooks-and-slack.md`.
3. Start the file with front matter.
4. Write the page in Simple English. Read [CONTRIBUTING.md](CONTRIBUTING.md).
5. Add the page to the list in this README.
6. Run the checks.

### Front matter

Each page starts with three fields:

```yaml
---
title: Webhooks and Slack
description: Send signed events to your own server, and post messages to a Slack channel.
order: 10
---
```

| Field | What it does |
|---|---|
| `title` | The title of the page in the navigation and in the browser tab. |
| `description` | One sentence for the search results and the social cards. |
| `order` | An integer. It sets the position of the page in its section, from low to high. |

After the front matter, start the body with `# <title>`.

### Links

- Link to another page with a relative path and the `.md` extension, for example `[Backups](../self-hosting/backups.md)`.
- Link to a heading with its slug, for example `[Identity verification](widget.md#identity-verification)`.
- Use the example hosts `feedback.example.com` (the dashboard) and `acme.feedback.example.com` (the public site of a project).

## Run the checks

The check script needs Node 20 or later. It has no dependencies.

To check the front matter and the links only:

```bash
node scripts/check-docs.mjs
```

To also check the artisan commands and the environment variables against the app, give the path of an app checkout:

```bash
FEEDBACKPILGRIM_APP_PATH=../feedbackpilgrim node scripts/check-docs.mjs
```

The script then makes sure that:

- each `php artisan <command>` in a page exists in the app,
- each environment variable in the code of a page exists in `.env.example`, `config/`, `docker-compose.yml`, `Dockerfile`, `deploy/` or `phpunit.xml` of the app,
- each internal link and each anchor resolves,
- each endpoint on a page in `api/` is an operation of `public/docs/openapi.json` of the app, and each operation of that spec is on a page in `api/`.

If the app checkout has a `vendor/` folder, the script reads the command list from `php artisan list`. If not, it reads the command signatures in `app/Console/Commands` and a fixed list of framework commands.

The CI runs the same script on each push and pull request. The CI clones the public app repository `amedina068/feedbackpilgrim` and runs all the checks.

## llms.txt for AI agents

`llms.txt` lists each page with its description, in the order of the "Pages" list above. `llms-full.txt` holds the text of all the pages in one file. AI agents read them from the raw GitHub URLs.

The script `scripts/build-llms.mjs` writes both files. After you add, move or change a page, run:

```bash
node scripts/build-llms.mjs
```

The CI runs `node scripts/build-llms.mjs --check`. The check fails if a file is not current.

## The MCP tools reference

`mcp/tools-reference.md` is written by hand from the tool classes in `app/Mcp/Tools` of the app. If a tool changes, update the page in the same pull request.

## Open questions

A paragraph that starts with `TODO(owner):` is a question for the maintainer. The code did not give the answer. To list the open questions, run:

```bash
grep -rn "TODO(owner):" --include=*.md .
```

## License

The pages of this repository are available under the [Creative Commons Attribution 4.0 International License](LICENSE) (CC BY 4.0). You can copy and change the pages if you give credit to Feedback Pilgrim and link to the source.

The code examples in the pages and the files in `scripts/` are available under the [MIT License](LICENSE-CODE). You can use the examples in your own code, open source or closed source.
