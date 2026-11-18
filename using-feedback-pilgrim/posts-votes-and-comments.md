---
title: Posts, votes and comments
description: How posts arrive, how to publish and archive them, and how votes, comments, notes and merges work.
order: 3
---

# Posts, votes and comments

A post is one piece of feedback, for example a feature request or a bug.

## Where posts come from

| Source | Author | Published | Other effects |
|---|---|---|---|
| The public site | The signed-in contact | Yes, at once | The author votes for the post. The first user of the project gets an email. |
| The dashboard (**Posts > New**) | The contact that you choose, or your admin contact | No | None |
| The REST API or the MCP server | No contact | No | None |

Each new post starts in the first `open` stage of the project, with the status `pending`. The REST API and the MCP server can give another status.

For each new post, the app also sends the `post.created` webhook event and a Slack message, if they are set. Read [Webhooks and Slack](webhooks-and-slack.md).

### A post from the public site

A signed-in contact fills in:

| Field | Rules |
|---|---|
| Title | Required |
| Content | Required |
| Tags | Optional. Tags of the project. |
| Attachments | Optional. Up to 10 files, 10 MB each. Types: `jpg`, `jpeg`, `png`, `gif`, `webp`, `pdf`, `doc`, `docx` and `txt`. |

The dashboard and the public site show the attachments of a post.

## Publish and archive

- **Publish** sets the publication date of a post. Only a published post shows on the public site.
- **Unpublish** removes the publication date.
- **Archive** hides the post from the post list of the dashboard and from the roadmap.
- **Unarchive** shows the post again.

The post list of the public site does not filter archived posts. A published post that is archived still shows on `/posts`.

A post from the dashboard, the REST API or the MCP server is not published. Publish it in the dashboard before customers can see it.

## The post list of the dashboard

Open **Posts** in the sidebar. The list shows 12 posts on each page.

| Control | What it does |
|---|---|
| Search | Finds the text in the title or the content. |
| Board tabs | Show the posts of one board. |
| Tags | Show the posts with the tags that you choose. |
| Show Completed | Also shows the posts with the status `completed`. |
| Show archived | Also shows the archived posts. |
| Sort | Sorts by date, or by priority (**Highest Priority**, **Lowest Priority**). |

### The priority score

The priority score of a post is the number of votes plus the sum of the MRR of the voters:

```text
score = number of votes + sum of the MRR of each voter
```

A vote from a contact with a high MRR raises the score more. Read [Contacts and revenue](contacts.md) to send the MRR of your customers.

## Votes

A signed-in contact can vote for a post on the public site, and remove the vote. Contacts can also vote for release notes and testimonials.

### Vote for a contact

If a customer asks for a feature by email or in a call, add the vote for the customer:

1. Open the post in the dashboard.
2. Open **Votes**.
3. Choose the contact.
4. Add the vote.

If the contact has a vote on the post already, the app shows the error `That contact has already voted on this post.`

## Comments

Contacts can comment on posts, release notes and testimonials on the public site. A comment can have up to 5 photos, 5 MB each, of the types `jpg`, `jpeg`, `png`, `gif` and `webp`.

A user can reply to a post in the dashboard. The reply comes from the admin contact of the user.

When someone comments on a post, the author of the post gets an email. The author gets no email for a comment of their own. Read [Notifications and weekly reports](notifications-and-weekly-reports.md).

## Notes

Each post has private notes for the team. The notes do not show on the public site. The REST API returns the notes in the `notes` field.

## Merge duplicate posts

If two posts ask for the same thing, merge the duplicate into the main post:

1. Open the duplicate post.
2. In the merge panel, choose the main post.
3. Confirm the merge.

The merge does these steps in one database transaction:

1. It removes the votes of the duplicate from contacts that voted for the main post already.
2. It moves the other votes to the main post.
3. It moves the comments to the main post.
4. It moves the attachments to the main post.
5. It deletes the duplicate.

CAUTION: Make sure that you choose the correct main post. You cannot undo a merge.

## Change the stage

Move a post to another stage on the kanban board, or choose a stage on the page of the post. Read [Stages and the roadmap](stages-and-roadmap.md).
