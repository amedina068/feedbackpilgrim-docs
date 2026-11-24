---
title: Testimonials
description: Collect testimonials with an optional rating, import them from Senja, approve them, and ask for them by email when a request ships.
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
| A Senja CSV file (**Testimonials > Import**) | Title, description, user name, subtitle, avatar, rating, date | Yes | None |

On the public site, a contact can edit their own testimonials. A contact sees their own testimonials before approval.

The widget endpoint accepts 5 testimonials a minute from each IP address.

## Import testimonials from Senja

You can import a CSV export from [Senja](https://senja.io). Each row with text becomes an approved testimonial.

1. In Senja, export your testimonials as a CSV file.
2. In the dashboard, open **Testimonials**.
3. Click **Import**.
4. In **CSV file**, select the file.
5. Click **Import**.

The page then shows "Imported N testimonials (M skipped)."

### The columns

| Senja column | Testimonial field |
|---|---|
| `text` | The description. A row without text is skipped. |
| `customer_name` | The user name. If it is empty, the user name is `Anonymous`. |
| `customer_tagline` | The subtitle |
| `customer_company` | The subtitle, if `customer_tagline` is empty |
| `customer_avatar` | The avatar. The app keeps only an `https` URL of 255 characters or fewer. |
| `rating` | The rating, from 1 to 5. Another value, for example `0`, gives no rating. |
| `title` | The title |
| `date` | The creation date and the approval date. If the date is empty or not valid, the app uses the time of the import. |

The file must have the columns `text` and `customer_name`. If one is missing, the app refuses the file with "This doesn't look like a Senja CSV export — the expected columns are missing."

### Limits of the import

- The file is a CSV file of 2 MB or less.
- The file has 5000 rows or fewer. If the file has more rows, the app imports no row. Split the file and import each part.
- The app skips a row with text of more than 5000 characters. It also skips a row with a title, a user name or a subtitle of more than 255 characters.
- The app keeps the rating of a row also when the **Rating** setting is off.
- The imported testimonials have no contact.
- The app stores the URL of the avatar. It does not copy the image. The public site loads the image from that URL.
- The app does not look for duplicates. If you import the same file two times, the project gets each testimonial two times.
- A user can start 10 imports each minute.

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
