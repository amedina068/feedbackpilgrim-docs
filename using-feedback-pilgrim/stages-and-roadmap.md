---
title: Stages and the roadmap
description: The status pipeline of a project, the kanban board, and the public roadmap.
order: 4
---

# Stages and the roadmap

A stage is one step of the status pipeline of a post, for example `Planned` or `In Progress`. The dashboard calls a stage a "status". All the boards of a project share the stages.

## The default stages

Each new project gets these six stages:

| Stage | Type | On the roadmap | Color |
|---|---|---|---|
| Open | `open` | No | `#94a3b8` |
| Under Review | `open` | No | `#eab308` |
| Planned | `planned` | Yes | `#6366f1` |
| In Progress | `active` | Yes | `#3b82f6` |
| Complete | `complete` | Yes | `#22c55e` |
| Closed | `closed` | No | `#6b7280` |

## Stage types and the status of a post

The stage is the source of truth for the progress of a post. Each post also has a `status` field for the REST API, the MCP server and the metrics. The app keeps the two fields in step.

| Stage type | Status of the post |
|---|---|
| `open` | `pending` |
| `planned` | `in_progress` |
| `active` | `in_progress` |
| `complete` | `completed` |
| `closed` | `pending` |

When the REST API or the MCP server sets a status, the app moves the post to the first stage of the matching type:

| Status | Stage type |
|---|---|
| `pending` | `open` |
| `in_progress` | `active` |
| `completed` | `complete` |

## The kanban board

The kanban board shows the stages as columns. It shows the posts of one board at a time. Open it from the **Boards** page.

Drag a post to another column to change its stage. The change saves at once.

## Manage the stages

On the kanban board, open **Manage statuses**.

| Field | Rules |
|---|---|
| Name | Required, 255 characters or fewer |
| Color | Required, a hex color with six digits, for example `#22c55e` |
| Type | Required. One of `open`, `planned`, `active`, `complete` or `closed`. |
| On the roadmap | On or off |

You can also change the order of the stages.

When you delete a stage, the app moves its posts to the first `open` stage of the project. You cannot delete the only `complete` stage. The app shows the error `You cannot delete the only "complete" status.`

## What happens when a post changes stage

These effects occur only when a user changes the stage in the dashboard, and only if the stage is different:

1. The app sends the `post.status_changed` webhook event.
2. The app posts a Slack message, if Slack is set.
3. If the new stage has the type `complete`, and the post was not complete before:
   - the author and each voter get the email "has been completed",
   - the app sends the `post.completed` webhook event,
   - the app can ask the author for a testimonial. Read [Testimonials](testimonials.md#ask-for-a-testimonial-automatically).
4. For any other stage, the author and each voter get an email with the new stage.

A status change from the REST API or the MCP server moves the post to a new stage. But it sends no email, no webhook event and no Slack message.

TODO(owner): Is it intended that a status change from the REST API or the MCP server sends no email to the voters and no webhook event?

## The public roadmap

The roadmap is at `/roadmap` on the public site of the project. It shows:

- the stages that are on the roadmap, in their order,
- in each stage, the published posts that are not archived, with the most votes first.

The visitor can filter the roadmap by a public board.

### Embed the roadmap

The roadmap also has an iframe version at `/iframe/roadmap`. The **Boards** page of the dashboard shows the snippet:

```html
<iframe src="https://acme.feedback.example.com/iframe/roadmap" width="100%" height="600" style="border:0" title="Roadmap"></iframe>
```

The iframe routes allow framing on any site. They send the header `Content-Security-Policy: frame-ancestors *`.
