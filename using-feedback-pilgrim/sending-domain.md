---
title: Send email from your domain
description: Connect a domain of your project, so that the emails to your contacts come from that domain through Amazon SES.
order: 10
---

# Send email from your domain

By default, the emails to your contacts come from the sender address of the instance, with the name of your project. With a sending domain, these emails come from an address on your own domain, for example `feedback@example.com`.

The emails go through Amazon SES. SES signs each email with DKIM for your domain, so the emails pass DMARC for your domain.

## Which emails use the sending domain

The sending domain applies to the emails to contacts:

- Post completed
- Post status changed
- Post commented
- Testimonial request

The emails to users do not change. For example, the new post email, the weekly report and the password reset still come from the sender address of the instance. Read [Notifications and weekly reports](notifications-and-weekly-reports.md) for the list of emails.

## Before you start

- The operator of the instance must set the SES keys. If the keys are not set, the connection of a domain fails. Read [Mail](../self-hosting/mail.md#sending-domains-for-projects).
- You need access to the DNS records of your domain.

## Connect a domain

1. In the dashboard, open **Settings > Email**.
2. In **Domain**, enter your domain, for example `example.com`.
3. In **Sender address**, enter the part before the `@`. The default is `feedback`.
4. Look at the **From** line below the fields. It shows the sender of the emails.
5. Click **Connect domain**. The page shows the DNS records.
6. Add each DNS record at your DNS provider.
7. Wait for SES to find the records. To check the domain at once, click **Check now**.

The replies of your contacts go to the sender address. Use an address that someone reads.

### The domain

- The app removes `https://`, `www.`, a path and a final dot. For example, `https://www.Example.com/path` becomes `example.com`.
- You can use a subdomain, for example `mail.example.com`.
- Free email domains do not work: `gmail.com`, `outlook.com`, `hotmail.com`, `yahoo.com`, `icloud.com`, `proton.me` and `aol.com`.
- The domain of the instance and the domain of its sender address do not work. Their subdomains also do not work.
- A domain can belong to one project only, in the whole instance.

### The sender address

The sender address is 64 characters or fewer. It can have lowercase letters, numbers, dots, dashes, plus signs and underscores. The app changes uppercase letters to lowercase.

## The DNS records

The page shows six records. In the table, `example.com` is your domain and `<region>` is the SES region of the instance.

| Purpose | Type | Name | Value |
|---|---|---|---|
| DKIM (three records) | CNAME | `<token>._domainkey.example.com` | `<token>.dkim.amazonses.com` |
| MAIL FROM | MX | `bounce.example.com` | `10 feedback-smtp.<region>.amazonses.com` |
| MAIL FROM | TXT | `bounce.example.com` | `v=spf1 include:amazonses.com ~all` |
| DMARC | TXT | `_dmarc.example.com` | `v=DMARC1; p=none;` |

Each record has a copy button. Copy the exact names and values from the page, because each domain gets its own DKIM tokens.

- SES verifies the domain with the three DKIM records.
- The MAIL FROM records set `bounce.example.com` as the bounce address. If these records are missing, SES uses its own bounce address.
- The DMARC record is a suggestion. If your domain already has a DMARC record, keep your record. A domain must have only one DMARC record.

## The states of a domain

| State | What it means | The emails come from |
|---|---|---|
| Pending | SES did not find the DKIM records yet. | The sender address of the instance |
| Verified | SES verified the domain. | The sender address on your domain |
| Verification lost | SES verified the domain before, but it does not verify the domain now. | The sender address of the instance |
| Failed | SES looked for the DKIM records for 72 hours and did not find them. | The sender address of the instance |

The app checks a pending domain every 10 minutes. It checks a verified domain again one time each day. It does not check a failed domain.

## If the domain failed

1. Click **Try again**. The app makes new DKIM records.
2. At your DNS provider, replace the old DKIM CNAME records with the new records.
3. Wait for SES to find the new records, or click **Check now**.

## Remove a domain

1. Click **Remove domain**.
2. Confirm the dialog.

The app removes the domain from the project and from SES. The emails come from the sender address of the instance again. The app does not change your DNS records. If you do not use the records again, remove them at your DNS provider.

## Limits

- A project has one sending domain. To use another domain, remove the domain first. Then connect the new domain.
- The From name is the name of the project. To change it, open **Settings > Project**.
- **Connect domain**, **Check now**, **Try again** and **Remove domain** accept 5 requests each minute for each user.
- If the SES account of the instance is in the SES sandbox, SES sends only to verified addresses. The operator must request production access from AWS.
- The app does not change DNS records. You add and remove the records yourself.
