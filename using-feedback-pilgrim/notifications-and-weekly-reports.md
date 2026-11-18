---
title: Notifications and weekly reports
description: The emails that Feedback Pilgrim sends to contacts and users, and the weekly activity report.
order: 9
---

# Notifications and weekly reports

Feedback Pilgrim sends all its notifications by email. The notifications go through the queue, so a queue worker must run. Read [Queues and the scheduler](../self-hosting/queues-and-scheduler.md) and [Mail](../self-hosting/mail.md).

## Emails to contacts

| Email | When | Recipients |
|---|---|---|
| Post completed | A user moves a post to a `complete` stage, and the post was not complete before. | The author of the post and each voter |
| Post status changed (subject `Update on "<title>"`) | A user moves a post to another stage that is not `complete`. | The author of the post and each voter |
| Post commented | Someone comments on a post. | The author of the post, if the comment is not from the author |
| Testimonial request (subject `Share your experience with us!`) | A post becomes complete and the automation is on. | The author of the post. Read [Testimonials](testimonials.md#ask-for-a-testimonial-automatically). |

The app sends one email to each voter, also if the contact voted more than one time. The author of the post does not get the voter email in addition.

The button in an email to a contact opens the public site and signs in the contact. The link stays valid for 7 days.

A stage change from the REST API or the MCP server sends no email. Read [Stages and the roadmap](stages-and-roadmap.md#what-happens-when-a-post-changes-stage).

## Emails to users

| Email | When | Recipients |
|---|---|---|
| New post | A contact writes a post on the public site. | The first user of the project, unless the post is from the admin contact of that user |
| Release note commented | A contact comments on a release note. | The user who wrote the release note |
| Weekly report (subject `Weekly Report for <project>`) | Every Monday at 09:00 | Each user of each project |

## The weekly report

The scheduler runs `php artisan fp:weekly` every Monday at 09:00. The app uses the time zone `UTC`.

The command does two steps:

1. It computes the report of the previous week, from Monday to Sunday, for each project, and stores it.
2. It sends the report by email to each user of each project.

The report has these values:

| Value | Meaning |
|---|---|
| Posts Created | The new posts of the project in the week, from all sources. |
| Posts Completed | The posts with the status `completed` that changed in the week. |
| Active Contacts | The contacts with a post, a comment or a vote in the week. |
| Total Engagement Events | The number of contact logins in the week. |
| Top Post Creators | The contacts with the most posts. |
| Most Active Commenters | The contacts with the most comments. |

The week starts on Monday. The scheduled run on Monday at 09:00 reports the full week that ended on Sunday. A run by hand also reports the previous week.

To make and send the report by hand, run:

```bash
php artisan fp:weekly
```

The dashboard also shows the activity of the last 7 days: the contact logins by day, the top contacts and a summary.
