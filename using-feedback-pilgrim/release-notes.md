---
title: Release notes
description: Write release notes, show them on the public site, and open the newest note in your app with the widget.
order: 7
---

# Release notes

A release note is a changelog entry of a project. Contacts can read, vote and comment on release notes on the public site.

## Create a release note in the dashboard

Open **Release Notes** in the sidebar, then create a note.

| Field | Rules |
|---|---|
| Title | Required |
| Content | Required |
| Publication date | Optional (`published_at`). Leave it empty to save a draft. |

The app makes the slug from the title and the date of creation, for example `new-dashboard-20261117` for the title "New dashboard". The public URL of the note is `/release-notes/<slug>` on the public site.

## Publish and unpublish

The publication date (`published_at`) is the only switch. A note with a publication date is published. A note without one is a draft.

The page of a note has one of these buttons:

- **Publish** (for a draft): sets the publication date to the current time. If the note already has a date, the note keeps it.
- **Unpublish** (for a published note): clears the publication date. The note becomes a draft.

## What the public site shows

The public site, the widget and the iframe show only the published notes. A draft gets 404 on the public site.

## Release notes from the REST API or the MCP server

The REST API and the MCP server create a draft by default. They can change the title, the content and the tags.

To publish or unpublish a note, send `published`:

| Value | Result |
|---|---|
| `true` | The note is published. If the note has no publication date, it gets the current time. |
| `false` | The publication date is cleared. The note becomes a draft. |

Read [Release notes in the API](../api/release-notes.md) and the [MCP tools reference](../mcp/tools-reference.md).

## The release notes in your app

The widget can show the release notes of the project in an iframe in your app. It can also open the newest note one time for each contact. Read [The embeddable widget](widget.md#release-notes).

The iframe is at `/iframe/release-notes` on the public site.

## Comments on release notes

When a contact comments on a release note, the user who wrote the note gets an email. Read [Notifications and weekly reports](notifications-and-weekly-reports.md).

## Edit a release note

The **Edit** link on the page of a note opens a form for the title and the content. The dashboard has no delete for a release note.
