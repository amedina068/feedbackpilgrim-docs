---
title: Release process
description: Write release notes and changelog lines for a change that users can see, and how a new version is made and published.
order: 4
---

# Release process

The `main` branch of the app has a changelog and a workflow that publishes the Docker image, but no version tags yet. This page explains the release notes and the changelog. It also has the facts that the code gives about versions, and the questions for the maintainer.

## Release notes

[Release notes](../getting-started/release-notes.md) in this docs repository holds the release notes of Feedback Pilgrim. The app repository has no release notes file.

The release notes of the app are not the release notes feature of Feedback Pilgrim. That feature lets a project publish its own changelog. Read [Release notes](../using-feedback-pilgrim/release-notes.md).

### In a pull request of the app

A pull request with a change that users can see has a `## Release note` section in its body. Write one or two short sentences in plain text. Tell the user what changed and what to do.

```markdown
## Release note

The weekly report now covers the previous week, Monday to Sunday.
```

A pull request without a change for users has no `## Release note` section.

### When a release goes out

1. Collect the `## Release note` sections of the merged pull requests.
2. Open `getting-started/release-notes.md` in the docs repository.
3. Find the heading of the release date, for example `## November 18, 2026`. If it does not exist, add it above the other dates.
4. Add one bullet for each note. Copy the text of the note as it is.
5. Open a pull request in the docs repository.

### Rules

- Write plain text. Do not use Markdown links or HTML in a note.
- Write one change in each bullet.
- Keep the newest date first. Do not add a second heading for the same date.
- Do not change old notes.

## Versions and images: what the code gives

- The project uses Semantic Versioning. `CHANGELOG.md` follows Keep a Changelog. The first version, `0.1.0`, is in the changelog, but it has no release date yet.
- If a pull request changes the behavior for users, it adds one line under `[Unreleased]` in `CHANGELOG.md`. The sections are `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` and `Security`.
- `CHANGELOG.md` lists the changes of each version of the code. The release notes page of the docs lists the changes that users can see, by date. A change for users goes in `CHANGELOG.md` and in the `## Release note` section of the pull request.
- A push of a tag that starts with `v`, for example `v1.2.3`, starts `.github/workflows/docker-publish.yml`. A push to a branch or a pull request does not publish an image.
- The workflow builds the image for `linux/amd64` and `linux/arm64` and pushes it to `ghcr.io/<owner>/feedbackpilgrim`.
- The tag `v1.2.3` gives the image tags `1.2.3`, `1.2` and `latest`. The major tag `1` starts at `1.0.0`, so a `v0` tag gives no major tag.
- A pre-release tag, for example `v1.3.0-rc.1`, gives only the image tag `1.3.0-rc.1`. The tag `latest` stays on the last stable release.
- `.github/workflows/ci.yml` runs on each push to `main` and on each pull request. It runs Pint, the PHP tests, the JS build and the JS tests, and a check that the API docs files are current.
- `SECURITY.md` says that only the latest release gets security fixes.
- The MCP server reports the version `1.0.0`. The value is in the `#[Version]` attribute of `App\Mcp\Servers\PublicServer`.
- The OpenAPI document reports the version `1.0.0` in `info.version`.
- The REST API has the version in its path: `/api/public/v1`.
- The `web` service runs the new migrations at start. Thus an update is `git pull` and `docker compose up -d --build`. Read [Upgrading](../getting-started/upgrading.md).

## Open questions

TODO(owner): The project uses Semantic Versioning, and a `v` tag publishes the image. When do you make a tag, and who makes it?

TODO(owner): The MCP server and the OpenAPI document both say `1.0.0`. Do these versions follow the version of the app, or do they change only when the API contract changes?

TODO(owner): CI runs Pint, the PHP tests, the JS build and tests, and the API docs check. Which other checks must pass before a release, and who approves it?
