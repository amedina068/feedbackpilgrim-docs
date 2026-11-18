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
| Date | Required. The publication date (`published_at`). |
| Status | Required. `draft` or `published`. |

The app makes the slug from the title and the date of creation, for example `new-dashboard-20261117` for the title "New dashboard". The public URL of the note is `/release-notes/<slug>` on the public site.

The page of a note has a **Publish** button for a draft, and a button that sets a published note back to `draft`. These buttons change the `status` field only.

## What the public site shows

The public site, the widget and the iframe show the release notes that have a publication date (`published_at`). They do not read the `status` field.

TODO(owner): The public site shows a note with a publication date, also when its status is `draft`. Is the `status` field meant to hide a draft from the public site?

## Release notes from the REST API or the MCP server

The REST API and the MCP server create a note with the status `draft` and no publication date. They can change the title, the content and the tags. They cannot set the status or the publication date.

TODO(owner): A note from the REST API or the MCP server has no publication date, and no screen or endpoint sets one. How does such a note get to the public site?

## The release notes in your app

The widget can show the release notes of the project in an iframe in your app. It can also open the newest note one time for each contact. Read [The embeddable widget](widget.md#release-notes).

The iframe is at `/iframe/release-notes` on the public site.

## Comments on release notes

When a contact comments on a release note, the user who wrote the note gets an email. Read [Notifications and weekly reports](notifications-and-weekly-reports.md).

The page of a note has an **Edit** link, but the dashboard has no edit page. The link returns 404.

TODO(owner): The dashboard has no route to edit or delete a release note. Is this planned? Until then, do you want to remove the **Edit** link?
