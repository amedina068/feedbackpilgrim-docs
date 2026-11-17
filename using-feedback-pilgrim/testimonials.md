---
title: Testimonials
description: Collect testimonials with an optional rating, approve them, and ask for them by email when a request ships.
order: 8
---

# Testimonials

A testimonial is a text from a customer, with an optional star rating from 1 to 5. A testimonial shows on the public site after a user approves it.

## Where testimonials come from

| Source | Fields | Approved at creation | Author |
|---|---|---|---|
| The public site (`/testimonials/create`) | Title, description, rating | No | The signed-in contact |
| The widget | Description, rating | No | The contact of the widget, or `Anonymous User` |
| The dashboard (**Testimonials > New**) | Title, description, user name, subtitle, contact, rating | Yes | The contact that you choose, or none |
| The REST API or the MCP server | Description, user name, rating, contact | No | The contact that you give, or none |

On the public site, a contact can edit their own testimonials. A contact sees their own testimonials before approval.

The widget endpoint accepts 5 testimonials a minute from each IP address.

## Approve a testimonial

Open the testimonial in the dashboard. Then:

- **Approve** sets the approval date. The public site shows the testimonial.
- The second button removes the approval date. The public site hides the testimonial again.

The REST API and the MCP server approve a testimonial when you set `approved_at`.

The **Testimonials** list can show all, the approved or the pending testimonials.

## Testimonial settings

Open **Settings > Testimonials**.

| Setting | Default | What it does |
|---|---|---|
| Rating | Off | If on, the forms of the public site, the widget and the dashboard require a rating from 1 to 5. If off, these forms store no rating. |
| Automation | Off | If on, the app can ask for a testimonial by email when a post is complete. |
| Email text | A default text | The text of the request email. 5000 characters or fewer. |

## Ask for a testimonial automatically

If **Automation** is on, the app can send the email "Share your experience with us!". It does this when a user moves a post to a stage of the type `complete`. The app sends the email to the author of the post only if all these conditions are true:

1. The post has an author.
2. The author has no testimonial in the project yet.
3. No other post of the author became complete in the last month.

The button in the email opens `/testimonials/create` on the public site and signs in the contact. The link stays valid for 7 days.

### The email text

Put the token `{testimonialButton}` in the email text. The app puts the **Leave a Testimonial** button in that place. The text before the token goes above the button, and the text after the token goes below it. If the text has no token, the app puts the button at the end.

The app prints the email text as plain text. It does not fill in variables. The default text starts with `Hi {{ $contact->name ?? $contact->email }},`, and the email shows this expression as it is. To greet the customer correctly, replace the expression with your own greeting.
