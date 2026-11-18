---
title: MCP tools reference
description: The name, the purpose and the arguments of each tool of the Feedback Pilgrim MCP server.
order: 3
---

# MCP tools reference

The Feedback Pilgrim MCP server has 21 tools. This page lists them in the order that `tools/list` returns them. The source is the tool classes in `app/Mcp/Tools` of the app. If a tool changes, update this page.

Each tool works on the project of the token. No tool takes a project ID. A record of another project gives the error `Resource not found.`

The list tools share these arguments:

| Argument | Type | Rules | Description |
|---|---|---|---|
| `page` | integer | 1 or more | The page to return. Default 1. |
| `per_page` | integer | 1 to 100 | The records on each page. Default 15. |
| `sort_direction` | string | `asc` or `desc` | The sort direction. |

Read [MCP server](overview.md) for the response format.

## Summary

| Tool | What it does | Changes data |
|---|---|---|
| [`list_posts`](#list_posts) | Lists the posts. | No |
| [`get_post`](#get_post) | Returns one post. | No |
| [`create_post`](#create_post) | Creates a post. | Yes |
| [`update_post`](#update_post) | Updates a post. | Yes |
| [`create_post_comment`](#create_post_comment) | Replies to a post. | Yes |
| [`list_release_notes`](#list_release_notes) | Lists the release notes. | No |
| [`get_release_note`](#get_release_note) | Returns one release note. | No |
| [`create_release_note`](#create_release_note) | Creates a release note. | Yes |
| [`update_release_note`](#update_release_note) | Updates a release note. | Yes |
| [`list_contacts`](#list_contacts) | Lists the contacts. | No |
| [`get_contact`](#get_contact) | Returns one contact. | No |
| [`create_contact`](#create_contact) | Creates or updates a contact by email. | Yes |
| [`update_contact`](#update_contact) | Updates a contact. | Yes |
| [`list_testimonials`](#list_testimonials) | Lists the testimonials. | No |
| [`get_testimonial`](#get_testimonial) | Returns one testimonial. | No |
| [`create_testimonial`](#create_testimonial) | Creates a testimonial. | Yes |
| [`update_testimonial`](#update_testimonial) | Updates or approves a testimonial. | Yes |
| [`list_tags`](#list_tags) | Lists the tags. | No |
| [`create_tag`](#create_tag) | Creates a tag. | Yes |
| [`update_tag`](#update_tag) | Renames a tag. | Yes |
| [`delete_tag`](#delete_tag) | Deletes a tag. | Yes |

## list_posts

Lists the posts of the project. Each post has its contact, tags and votes.

| Argument | Type | Required | Description |
|---|---|---|---|
| `page` | integer | No | The page. |
| `per_page` | integer | No | The records on each page, maximum 100. |
| `search` | string | No | Finds the text in the title or the content. |
| `status` | string | No | `pending`, `in_progress` or `completed`. |
| `tag` | string | No | Only the posts with a tag of this title. |
| `published` | boolean | No | `true` for published posts only, `false` for unpublished posts only. |
| `sort_by` | string | No | `created_at` (default), `updated_at`, `title`, `status` or `published_at`. |
| `sort_direction` | string | No | `asc` or `desc` (default). |

## get_post

Returns one post with its contact, tags, votes and comments.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the post. |

## create_post

Creates a post. The post has no author and is not published. Each call makes a new post.

| Argument | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | The title, 255 characters or fewer. |
| `content` | string | Yes | The text of the post. |
| `status` | string | No | `pending` (default), `in_progress` or `completed`. |
| `board_id` | integer | No | A board of the project. Default: the first board. |
| `tags` | integer array | No | Tag IDs of the project. |

The result is the post with its tags and contact.

## update_post

Updates a post. Only the arguments that you send change. A new `status` moves the post to the first stage of the matching type. It sends no email and no webhook event.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the post. |
| `title` | string | No | The new title. |
| `content` | string | No | The new text. |
| `status` | string | No | `pending`, `in_progress` or `completed`. |
| `board_id` | integer | No | Moves the post to this board of the project. |
| `tags` | integer array | No | Tag IDs. The list replaces all the tags of the post. |

## create_post_comment

Replies to a post. The comment comes from the admin contact of the user of the token. If the post has an author, the author gets an email. Each call adds a new comment.

| Argument | Type | Required | Description |
|---|---|---|---|
| `post_id` | integer | Yes | The ID of the post. |
| `content` | string | Yes | The text of the comment. |

The result is the comment with its contact.

## list_release_notes

Lists the release notes of the project. Each note has its tags, votes and comments.

| Argument | Type | Required | Description |
|---|---|---|---|
| `page` | integer | No | The page. |
| `per_page` | integer | No | The records on each page, maximum 100. |
| `search` | string | No | Finds the text in the title or the content. |
| `published` | boolean | No | `true` for notes with a publication date, `false` for notes without one. |
| `tag` | string | No | Only the notes with a tag of this title. |
| `sort_by` | string | No | `created_at` (default), `updated_at`, `title` or `published_at`. |
| `sort_direction` | string | No | `asc` or `desc` (default). |

## get_release_note

Returns one release note with its tags, votes and comments.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the release note. |

## create_release_note

Creates a release note with the status `draft` and no publication date. The user of the token is the author. Each call makes a new note.

| Argument | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | The title, 255 characters or fewer. |
| `content` | string | Yes | The text. Markdown is allowed. |
| `tags` | integer array | No | Tag IDs of the project. |

## update_release_note

Updates a release note. Only the arguments that you send change.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the release note. |
| `title` | string | No | The new title. |
| `content` | string | No | The new text. |
| `tags` | integer array | No | Tag IDs. The list replaces all the tags of the note. |

## list_contacts

Lists the contacts of the project. Each contact has its tags and votes. The custom attributes are fields of each record.

| Argument | Type | Required | Description |
|---|---|---|---|
| `page` | integer | No | The page. |
| `per_page` | integer | No | The records on each page, maximum 100. |
| `search` | string | No | Finds the text in the name or the email. |
| `tag` | string | No | Only the contacts with a tag of this title. |
| `sort_by` | string | No | `created_at` (default), `updated_at`, `name`, `email`, `mrr` or `ltv`. |
| `sort_direction` | string | No | `asc` or `desc` (default). |

## get_contact

Returns one contact with its tags and votes. The custom attributes are fields of the record.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the contact. |

## create_contact

Creates a contact, or updates the contact with the same email in the project. The result has the field `was_created`: `true` for a new contact, `false` for an update.

| Argument | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | The name, 255 characters or fewer. |
| `email` | string | Yes | The email. The tool finds the contact by this value. |
| `avatar` | string | No | The URL of an avatar image. |
| `mrr` | number | No | The monthly recurring revenue. |
| `ltv` | number | No | The lifetime value. |
| `tags` | integer array | No | Tag IDs of the project. |

Other arguments become custom attributes, with the limits in [Contacts](../api/contacts.md#create-or-update-a-contact).

## update_contact

Updates a contact. Only the arguments that you send change.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the contact. |
| `name` | string | No | The new name. |
| `email` | string | No | The new email. It must be unique in the project. |
| `avatar` | string | No | The new avatar URL. |
| `mrr` | number | No | The monthly recurring revenue. |
| `ltv` | number | No | The lifetime value. |
| `tags` | integer array | No | Tag IDs. The list replaces all the tags of the contact. |

## list_testimonials

Lists the testimonials of the project. Each testimonial has its contact, votes and comments.

| Argument | Type | Required | Description |
|---|---|---|---|
| `page` | integer | No | The page. |
| `per_page` | integer | No | The records on each page, maximum 100. |
| `search` | string | No | Finds the text in the description or the user name. |
| `approved` | boolean | No | `true` for the approved testimonials. If you omit it, or send `false`, the list holds the pending testimonials only. |
| `rating` | integer | No | Only the testimonials with this rating, 1 to 5. |
| `sort_by` | string | No | `created_at` (default), `updated_at`, `rating` or `approved_at`. |
| `sort_direction` | string | No | `asc` or `desc` (default). |

## get_testimonial

Returns one testimonial with its contact, votes and comments.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the testimonial. |

## create_testimonial

Creates a pending testimonial. Each call makes a new testimonial.

| Argument | Type | Required | Description |
|---|---|---|---|
| `description` | string | Yes | The text of the testimonial. |
| `username` | string | Yes | The name to show, 255 characters or fewer. |
| `rating` | integer | No | The rating, 1 to 5. |
| `contact_id` | integer | No | A contact of the project. |

## update_testimonial

Updates a testimonial. Only the arguments that you send change. To approve the testimonial, send `approved_at`.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the testimonial. |
| `description` | string | No | The new text. |
| `username` | string | No | The new name to show. |
| `rating` | integer | No | The rating, 1 to 5. |
| `approved_at` | string | No | An ISO 8601 date and time. It approves the testimonial. |

## list_tags

Lists the tags of the project. Each tag has `posts_count` and `contacts_count`.

| Argument | Type | Required | Description |
|---|---|---|---|
| `page` | integer | No | The page. |
| `per_page` | integer | No | The records on each page, maximum 100. |
| `search` | string | No | Finds the text in the title. |
| `sort_by` | string | No | `title` (default), `created_at` or `updated_at`. |
| `sort_direction` | string | No | `asc` (default) or `desc`. |

## create_tag

Creates a tag. Each call tries to make a new tag.

| Argument | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | The title. It must be unique in the project. |

## update_tag

Renames a tag.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the tag. |
| `title` | string | Yes | The new title. It must be unique in the project. |

## delete_tag

Removes the tag from its posts and contacts, then deletes the tag. The result is `{"deleted": true, "id": <id>}`.

| Argument | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | The ID of the tag. |

CAUTION: You cannot undo a delete. This is the only delete tool of the server.
