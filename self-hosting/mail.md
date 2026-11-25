---
title: Mail
description: Configure SMTP, Mailgun or Amazon SES for the emails of Feedback Pilgrim.
order: 4
---

# Mail

Do not want to run a server? Use [Feedback Pilgrim Cloud](../getting-started/cloud.md).

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

The port sets the TLS mode. Port `465` uses implicit TLS. Each other port, for example `587`, starts without TLS and uses STARTTLS when the server offers it.

To set the TLS mode yourself, set `MAIL_SCHEME` to `smtp` (STARTTLS) or `smtps` (implicit TLS). The app does not read the old Laravel value for the encryption. A change to that value has no effect.

## Mailgun

1. Set `MAIL_MAILER=mailgun`.
2. Set `MAILGUN_DOMAIN` and `MAILGUN_SECRET`.
3. To use another Mailgun API host, set `MAILGUN_ENDPOINT`. The default is `api.mailgun.net`.

The app has the package `symfony/mailgun-mailer`.

## Amazon SES

1. Set `MAIL_MAILER=ses`.
2. Set `AWS_SES_ACCESS_KEY_ID` and `AWS_SES_SECRET_ACCESS_KEY`.
3. Set `AWS_SES_REGION`.

The app has the AWS SDK for PHP.

| Variable | If it is empty, the app uses | What it does |
|---|---|---|
| `AWS_SES_ACCESS_KEY_ID` | `AWS_ACCESS_KEY_ID` | The access key for SES. |
| `AWS_SES_SECRET_ACCESS_KEY` | `AWS_SECRET_ACCESS_KEY` | The secret key for SES. |
| `AWS_SES_REGION` | `AWS_DEFAULT_REGION`, then `us-east-1` | The SES region. |
| `AWS_SES_CONFIGURATION_SET` | No configuration set | Optional. The SES configuration set for each email from the `ses` mailer. |

An instance that used only the `AWS_*` values before keeps working. The `AWS_SES_*` values are optional.

## Sending domains for projects

A project can send the emails to its contacts from its own domain. Read [Send email from your domain](../using-feedback-pilgrim/sending-domain.md) for the steps of the user.

The SES account of the instance sends for all projects. The projects do not give AWS keys. The emails from a verified domain always use the `ses` mailer. The other emails use `MAIL_MAILER`, so `MAIL_MAILER` can stay `smtp`.

### Prepare the SES account

1. Create an IAM user for the app. Give it only these actions:
   - `ses:CreateEmailIdentity`
   - `ses:GetEmailIdentity`
   - `ses:DeleteEmailIdentity`
   - `ses:PutEmailIdentityMailFromAttributes`
   - `ses:TagResource`
   - `ses:SendRawEmail`
2. Request SES production access from AWS. In the sandbox, SES sends only to verified addresses, also from a verified domain.
3. Turn on the account-level suppression list for bounces and complaints. All projects share the reputation of the account.
4. Set `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY` and `AWS_SES_REGION`.
5. Make sure that the scheduler runs. Read [Queues and the scheduler](queues-and-scheduler.md).
6. If the app runs on more than one server, set `CACHE_DRIVER` to `redis` or `database`.
7. Give the queue worker 512 MB of memory or more, for example `php artisan queue:work --tries=3 --memory=512`. The AWS SDK uses more memory.

If the scheduler does not run, the app checks a domain only when a user clicks **Check now**.

The app holds a cache lock for each domain while it changes the SES identity. A `file` cache locks on one server only. Thus more than one server needs a shared cache store.

### SES identities

- The app creates one SES identity for each connected domain. It gives each identity the tag `app=feedbackpilgrim`.
- The app deletes an identity only if the identity has this tag and no project has the domain. It never uses an identity that another app made.
- If the SES account already has an identity for a domain without this tag, the connection fails with "This domain is already connected."
- If SES refuses a request, the page shows "Amazon SES could not complete the request. Try again in a few minutes." The log has the AWS error code.

## Postmark

The app does not support Postmark. The configuration has a `postmark` mailer and `POSTMARK_TOKEN`, but the mailer needs the package `symfony/postmark-mailer`. The app does not include this package. If you set `MAIL_MAILER=postmark`, each email fails.

## Test without a mail server

Set `MAIL_MAILER=log`. The app then writes each email to the log, and sends nothing. Use this mode only for a test.

## If the instance has no mail

Without mail, a user cannot reset a password with the form, and contacts get no notifications. To set a password in the terminal, read [Recover access](recover-access.md).
