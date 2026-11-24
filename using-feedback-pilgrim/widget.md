---
title: The embeddable widget
description: Add pilgrim.js to your app to sign in your users on the public site, and to show the release notes and the testimonial form.
order: 11
---

# The embeddable widget

The widget is the script `pilgrim.js`. Add it to your own app. The widget can:

- sign in the users of your app on the public site of your project, without a second login,
- create or update the contact of each user, with the MRR, the LTV and custom attributes,
- show the release notes in an iframe, and open the newest note one time for each contact,
- show the testimonial form in an iframe.

The widget is not the REST API. It uses the publishable key of the project, not an API token.

## Keys

Open **Settings > Embed Widget** in the dashboard.

| Key | Format | Public | What it does |
|---|---|---|---|
| Publishable key | `pk_` and 32 letters and digits | Yes | Identifies the project. It gives no API access. You can put it in HTML. |
| Identity secret | 64 hexadecimal characters | No | Your server uses it to sign the email of the signed-in user. |

WARNING: Keep the identity secret on your server. Never put it in HTML or JavaScript. With the secret, anyone can sign in as any contact of your project.

The app stores the identity secret encrypted with `APP_KEY`. To make a new secret, click **Regenerate secret**. After that, a user fails the verification until your app uses the new secret.

## Add the widget

1. Add the script to the pages of your app. Use the `pilgrim.js` of your instance:

   ```html
   <script src="https://feedback.example.com/pilgrim.js" data-client="pk_your_publishable_key"></script>
   ```

2. On your server, make the identity hash of the email of the signed-in user:

   ```php
   $userHash = hash_hmac('sha256', strtolower(trim($user->email)), $identitySecret);
   ```

   In Node.js:

   ```js
   import { createHmac } from 'node:crypto'

   // The same rule as PHP strtolower(trim($email)).
   const normalizedEmail = email
     .replace(/^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g, '')
     .replace(/[A-Z]/g, (letter) => letter.toLowerCase())

   const userHash = createHmac('sha256', identitySecret).update(normalizedEmail).digest('hex')
   ```

   The app removes only the spaces, tabs, line breaks, NUL and vertical tabs at the start and at the end of the email. It changes only the letters `A` to `Z` to lowercase. Do not use `trim()` and `toLowerCase()` of JavaScript. They also change other whitespace and the Unicode letters, and then the hash does not match.

3. Call `pilgrim()` at the end of the `<body>`:

   ```html
   <script>
     pilgrim({
       contact: {
         email: "jane@example.com", // required
         name: "Jane Doe",          // optional
         mrr: 49,                   // optional
         ltv: 1200,                 // optional
         plan: "pro",               // optional, a custom attribute
       },
       userHash: "<hash-from-your-server>",
       releaseNotes: { show: true, open: true }, // optional
       testimonials: true,                       // optional
     })
   </script>
   ```

4. Add these attributes to links or buttons in your app:

   | Attribute | What a click does |
   |---|---|
   | `data-pilgrim-link` | Opens the public site. With a valid `userHash`, it signs in the user. |
   | `data-pilgrim-release-notes` | Opens the release notes iframe. |
   | `data-pilgrim-testimonials` | Opens the testimonial form iframe. |

The widget reads the URL of your instance from the `src` of its own script tag. One build of `pilgrim.js` works on every host.

## What the widget sends

`pilgrim()` sends a `POST` request to `/api/v1/init` on your instance, with the header `Authorization: Bearer <publishable key>`. The body has `contact`, `releaseNotes`, `testimonials` and `user_hash`.

| Field of the contact | What the app does with it |
|---|---|
| `email` | Required. The app finds the contact by email in the project. |
| `name` | The name of the contact. |
| `mrr`, `ltv` | The revenue of the customer. Read [Contacts and revenue](contacts.md#revenue-weighting). |
| `avatar` | The URL of an avatar image. |
| Other keys | Custom attributes. The app ignores `top_customer`. |

The keys `show` and `open` of `releaseNotes` are both optional.

## Identity verification

The publishable key is public. Thus, the key alone does not prove who the user is. The identity hash (`userHash`) proves the email of the user.

| Request | Result |
|---|---|
| A correct `userHash` | The app creates or updates the contact and signs it in. |
| A wrong `userHash` | `403` with `{"error": "Identity verification failed"}`. |
| No `userHash`, and verification is required | `403` with `{"error": "Identity verification failed"}`. |
| No `userHash`, verification not required, new email | The app creates the contact and signs it in. |
| No `userHash`, verification not required, existing email | The app does not update or sign in the contact. `data-pilgrim-link` opens `/posts` without a sign-in. |

The widget never signs in the admin contact of a user. For an admin contact, `data-pilgrim-link` opens `/posts` without a sign-in.

**Require identity verification** is in **Settings > Embed Widget**. It is on for a new project. It is off for a project that existed before the setting. Turn it on after your app sends `userHash`.

## Release notes

If `releaseNotes.show` is `true`, the widget adds a hidden iframe with the release notes of the project. A click on an element with `data-pilgrim-release-notes` shows the iframe.

If `releaseNotes.open` is also `true`, the widget opens the iframe two seconds after the page loads. It does this only when the contact has not seen the newest note yet. The app stores the last note that it opened for each contact. Without a valid `userHash` for an existing contact, the iframe does not open by itself.

## Testimonials

If `testimonials` is `true`, the widget adds a hidden iframe with the testimonial form. A click on an element with `data-pilgrim-testimonials` shows the iframe.

When the app knows the contact, the iframe URL holds a signed contact token that stays valid for 24 hours. The testimonial then belongs to the contact. Without a valid token, the testimonial is from `Anonymous User`. Read [Testimonials](testimonials.md).

## Errors

| Status | Body | Cause |
|---|---|---|
| `401` | `{"error": "Invalid client key"}` | The key is not the publishable key of a project, or every user of the project is deactivated. |
| `403` | `{"error": "Identity verification failed"}` | Read [Identity verification](#identity-verification). |
| `422` | `{"message": "...", "errors": {...}}` or `{"error": "The request must include a contact with an email."}` | The request has no contact email. |

## The internal widget endpoints

The widget and its iframes use these endpoints. They are not part of the versioned REST API.

| Method | Path | Host | What it does |
|---|---|---|---|
| `POST` | `/api/v1/init` | Any | Signs in the contact and returns the iframe URLs. |
| `GET` | `/api/v1/release-notes` | The public site | Lists the release notes with a publication date. |
| `GET` | `/api/v1/testimonials/settings` | The public site | Returns `{"rating_enabled": true}` or `false`. |
| `POST` | `/api/v1/testimonials` | The public site | Stores a testimonial from the iframe. 5 requests a minute for each IP address. |
| `GET` | `/iframe/release-notes` | The public site | The release notes iframe. |
| `GET` | `/iframe/testimonials` | The public site | The testimonial form iframe. |
| `GET` | `/iframe/roadmap` | The public site | The roadmap iframe. |

The iframes and the page talk with `postMessage`. The iframe routes send `Content-Security-Policy: frame-ancestors *`.
