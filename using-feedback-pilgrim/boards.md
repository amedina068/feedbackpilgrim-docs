---
title: Boards
description: Group the posts of a project into boards, and choose which boards the public site shows.
order: 2
---

# Boards

A board is a group of posts in a project, for example `Feature Requests` or `Bugs`. Each post belongs to one board. Each project starts with one public board with the name `Feature Requests`.

All the boards of a project share the stages. Read [Stages and the roadmap](stages-and-roadmap.md).

## Manage boards

Open **Boards** in the sidebar. The page lists the boards in order, with the number of posts on each board.

| Field | Rules | What it does |
|---|---|---|
| Name | Required, 255 characters or fewer | The name of the board. The app makes the slug from the name. |
| Public | On or off | A public board shows in the board filter of the public site and of the roadmap. |

A new board goes to the end of the list.

### Delete a board

When you delete a board, the app moves its posts to the first other board of the project. A project must keep at least one board. If you try to delete the last board, the app shows the error `You must keep at least one board.`

## Where a new post goes

- A post from the dashboard, the REST API or the MCP server can name a board with `board_id`.
- If a post names no board, the app puts it on the first public board of the project.
- A post from the public site or the widget goes to the first public board of the project.
- If no board of the project is public, the post goes to the first board. The post does not show on the public site. After a contact sends the post, the public site opens the list of posts.

## The kanban board of a board

Each row of the **Boards** page links to the kanban board of that board, at `/board?board=<id>`. The kanban board shows one board at a time, with a board switcher. Read [Stages and the roadmap](stages-and-roadmap.md#the-kanban-board).

## Filter the posts by board

The **Posts** page of the dashboard has a tab for each board, and a **Manage boards** link.

The public site and the roadmap have a filter with the public boards only. Read the warning in [Projects and the public site](projects-and-public-site.md#the-public-site).

## Embed the roadmap

The **Boards** page shows an iframe snippet for the roadmap of the project. Read [Stages and the roadmap](stages-and-roadmap.md#embed-the-roadmap).

## Boards in the API and the MCP server

The REST API and the MCP server use the field `board_id` to write a post to a board. The REST API list of posts can filter by `board_id`. The board must belong to the project of the token.
