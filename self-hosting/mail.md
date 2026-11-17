---
title: Mail
description: Configure SMTP, Mailgun or Amazon SES for the emails of Feedback Pilgrim.
order: 4
---

# Mail

Feedback Pilgrim sends emails to users and contacts: password resets, notifications, weekly reports and testimonial requests. Read [Notifications and weekly reports](../using-feedback-pilgrim/notifications-and-weekly-reports.md) for the list.

Most emails go through the queue. Thus the queue worker must run. Read [Queues and the scheduler](queues-and-scheduler.md).

## The sender

| Variable | Default in `.env.example` | What it does |
|---|---|---|
| `MAIL_FROM_ADDRESS` | `"feedback@example.com"` | The sender address. |
| `MAIL_FROM_NAME` | `"${APP_NAME}"` | The sender name. |

## SMTP

SMTP is the default mailer.

| Variable | Default in `.env.example` |
|---|---|
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `127.0.0.1` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `null` |
| `MAIL_PASSWORD` | `null` |
| `MAIL_ENCRYPTION` | `tls` |

## Mailgun

1. Set `MAIL_MAILER=mailgun`.
2. Set `MAILGUN_DOMAIN` and `MAILGUN_SECRET`.
3. To use another Mailgun API host, set `MAILGUN_ENDPOINT`. The default is `api.mailgun.net`.

The app has the package `symfony/mailgun-mailer`.

## Amazon SES

1. Set `MAIL_MAILER=ses`.
2. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
3. Set `AWS_DEFAULT_REGION`. The default is `us-east-1`.

The app has the AWS SDK for PHP.

## Postmark

`config/mail.php` and `config/services.php` have a `postmark` mailer and `POSTMARK_TOKEN`. But `composer.json` does not require the package `symfony/postmark-mailer`, so the `postmark` mailer does not work.

TODO(owner): The configuration has a `postmark` mailer, but the app does not require `symfony/postmark-mailer`. Do you support Postmark?

## Test without a mail server

Set `MAIL_MAILER=log`. The app then writes each email to the log, and sends nothing. Use this mode only for a test.

## If the instance has no mail

Without mail, a user cannot reset a password with the form, and contacts get no notifications. To set a password in the terminal, read [Recover access](recover-access.md).
