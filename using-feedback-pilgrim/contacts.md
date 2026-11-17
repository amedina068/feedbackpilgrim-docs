---
title: Contacts and revenue
description: Where contacts come from, how MRR and LTV weight the posts, and how custom attributes work.
order: 6
---

# Contacts and revenue

A contact is a customer of one project. Contacts post, vote, comment and write testimonials on the public site. Each contact has a name, an email, an avatar, an MRR, an LTV, tags, notes and custom attributes.

## Where contacts come from

The dashboard has no form to create a contact. Contacts come from:

| Source | Match | Read more |
|---|---|---|
| The widget (`pilgrim.js`) | The email, in the project | [The embeddable widget](widget.md) |
| `POST /api/public/v1/contacts` | The email, in the project | [Contacts](../api/contacts.md) |
| `POST /api/public/v1/init` | The email, in the project | [Init](../api/init.md) |
| The MCP tool `create_contact` | The email, in the project | [MCP tools reference](../mcp/tools-reference.md#create_contact) |

Each source creates the contact if the email is new in the project. If the email exists, the source updates the contact. The widget updates an existing contact only with a valid identity hash. Read [The embeddable widget](widget.md#identity-verification).

If a contact has no avatar, the app makes an image with the initials of the contact.

## Revenue weighting

Each contact has two revenue fields:

| Field | Meaning |
|---|---|
| `mrr` | The monthly recurring revenue of the customer. |
| `ltv` | The lifetime value of the customer. |

Send the values from your app through the widget, the REST API or the MCP server. A user can also change them on the edit page of a contact.

The values change these parts of the dashboard:

- The priority score of a post is the number of votes plus the sum of the MRR of the voters. Sort the **Posts** list by **Highest Priority** to see the posts with the most revenue first.
- The **Contacts** list and the page of a contact mark the top 10 contacts by MRR. They also mark the top 10 contacts by LTV.
- The REST API and the MCP server can sort the contacts by `mrr` or `ltv`.

## Custom attributes

A contact can have custom attributes, for example a plan name or a company size. The app stores them in the `metadata` field of the contact.

- The widget stores each key of the contact object that is not `name`, `email`, `mrr`, `ltv` or `top_customer`.
- The REST API and the MCP server store each unknown field, and the keys of a `metadata` object.

When the metadata of a contact changes, a queued job adds each new key to the list of attributes of the project. The **Contacts** list uses this list to filter the contacts by an attribute value.

To make the list again from all the contacts, run:

```bash
php artisan fp:sync-contact-attributes
```

The REST API and the MCP server apply these limits to the metadata:

- A key cannot start with `pilgrim_`. The app keeps these keys for itself.
- 50 keys or fewer, nested keys included.
- 3 levels of nesting or fewer.
- 16 KB or less as JSON.

The app stores two keys of its own: `pilgrim_last_login` (the last widget login) and `pilgrim_last_release_note` (the last release note that the widget opened for the contact). The API responses do not show these keys.

## The contacts list

Open **Contacts** in the sidebar. The list does not show the admin contacts of the users. You can:

- filter by tags,
- filter by the value of a custom attribute,
- sort the list.

Each row shows the number of posts, comments and votes of the contact.

## The page of a contact

The page of a contact shows:

- the number of sessions. The app counts one session a day at most, for each sign-in through the widget or the `init` API endpoint,
- the five newest posts, comments and votes,
- the tags,
- the top MRR and top LTV marks.

On the edit page, a user can change the name, the email, the notes, the MRR, the LTV, the tags and the custom attributes.

### View the site as a contact

**View site as contact** opens the public site and signs you in as this contact. Use it to see what the contact sees. While you are signed in as the contact, your posts, votes and comments come from the contact.

## Contacts in the API

The REST API and the MCP server can list, get, create and update contacts. They cannot delete a contact. Read [Contacts](../api/contacts.md) in the API section.
