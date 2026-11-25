---
title: Feedback Pilgrim Cloud
description: The hosted edition of Feedback Pilgrim. The plans, the trial, the URLs of a project, billing, and the differences from a self-hosted instance.
order: 2
---

# Feedback Pilgrim Cloud

Feedback Pilgrim Cloud is the hosted edition of Feedback Pilgrim. The Feedback Pilgrim team runs the instance at `https://app.feedbackpilgrim.com`. You do not install a server, a database, Redis, a queue worker or a scheduler.

The self-hosted edition stays free under the AGPL-3.0 license, with no limits. Read [Cloud and self-host](#cloud-and-self-host).

## Plans

| Plan | Monthly price | Yearly price | Projects |
|---|---|---|---|
| Starter | $25 USD | $250 USD | 1 |
| Pro | $59 USD | $590 USD | 5 |

- Both plans have all the features of Feedback Pilgrim.
- Both plans have no limit on contacts, posts and votes.
- The Pro plan also has priority email support.

The [pricing page](https://feedbackpilgrim.com/pricing) shows the same plans.

## The trial

Each new account starts with a free trial of 14 days. The trial needs no credit card. During the trial, the account has the limits of the Pro plan, that is 5 projects.

## Sign up and create your first project

1. Open [app.feedbackpilgrim.com/register](https://app.feedbackpilgrim.com/register).
2. Enter your name, your email and a password.
3. Click **Register**. The project form opens.
4. Enter the **Project name**.
5. Enter the **Project subdomain**, for example `acme`.
6. Click **Create project**. The dashboard of the new project opens.

The subdomain uses lowercase letters, digits and single hyphens. All the projects on Cloud are on one instance, so a subdomain must be unique on Cloud. Some subdomains are reserved. Read [Create a project](../using-feedback-pilgrim/projects-and-public-site.md#create-a-project).

CAUTION: Choose the subdomain with care. The subdomain of a project cannot change after you create the project.

To create one more project, open the project selector at the top of the sidebar and select **New project**. Your plan sets the number of projects.

## The URLs of a project

On Cloud, `APP_URL` is `https://app.feedbackpilgrim.com` and `APP_DOMAIN` is `app.feedbackpilgrim.com`. The other pages of these docs use the example host `feedback.example.com`. On Cloud, use these URLs:

| What | URL on Cloud |
|---|---|
| Dashboard | `https://app.feedbackpilgrim.com` |
| Public site of a project | `https://<subdomain>.app.feedbackpilgrim.com`, for example `https://acme.app.feedbackpilgrim.com` |
| REST API base URL | `https://app.feedbackpilgrim.com/api/public/v1` |
| URL for the SDKs | `https://app.feedbackpilgrim.com` |
| MCP server | `https://app.feedbackpilgrim.com/mcp` |
| Widget script | `https://app.feedbackpilgrim.com/pilgrim.js` |
| Widget init endpoint | `https://app.feedbackpilgrim.com/api/v1/init` |

Cloud has no custom domains. The public site of a project is always on a subdomain of `app.feedbackpilgrim.com`.

The **Settings > API Tokens** page of the dashboard shows the MCP server URL. The **Settings > Embed Widget** page shows the widget script.

An API request on Cloud:

```bash
curl https://app.feedbackpilgrim.com/api/public/v1/tags \
  -H "Authorization: Bearer <your-token>" \
  -H "Accept: application/json"
```

The widget script on Cloud:

```html
<script src="https://app.feedbackpilgrim.com/pilgrim.js" data-client="pk_your_publishable_key"></script>
```

Read [API overview](../api/overview.md), [MCP server](../mcp/overview.md), [SDKs](../sdks/overview.md) and [The embeddable widget](../using-feedback-pilgrim/widget.md).

## Billing

Stripe processes the payments. The billing page of the dashboard has all the billing tasks.

To choose a plan:

1. Open the billing page in the dashboard.
2. Select the Starter plan or the Pro plan.
3. Select the monthly payment or the yearly payment.
4. Enter your payment details.

To change your plan, open the billing page and select the other plan.

To cancel, open the billing page and cancel the subscription. You can cancel at any time.

The billing page also lists your invoices.

TODO(owner): The app repository has no billing code. What happens to the projects and the data of an account after it cancels the subscription?

## When the trial ends

If the trial ends and you did not choose a plan, the dashboard asks you to choose a plan. The public sites of your projects stay online.

To use the dashboard again, choose a plan on the billing page.

TODO(owner): Do the REST API, the MCP server and the widget continue to work after the trial ends without a plan?

## Cloud and self-host

| | Cloud | Self-host |
|---|---|---|
| Price | Starter $25 a month, Pro $59 a month | Free, under the AGPL-3.0 license |
| Projects | 1 (Starter) or 5 (Pro) | No limit |
| Server | The Feedback Pilgrim team runs it. | You run the web server, MySQL, Redis, the queue worker and the scheduler. |
| Dashboard | `https://app.feedbackpilgrim.com` | The `APP_URL` of your instance |
| Public site | `https://<subdomain>.app.feedbackpilgrim.com` | `https://<subdomain>.<APP_DOMAIN>` on your own domain |
| Custom domain | Not available | Your own domain |
| Admin area (`/admin`) and `php artisan` commands | Not available. The Feedback Pilgrim team is the owner of the instance. | Available to the owner |
| Support | Priority email support on the Pro plan | GitHub issues |

To self-host, read [Install with Docker](installation-docker.md).

## Move between Cloud and self-host

Feedback Pilgrim has no export function and no import function for a project. To move a project between Cloud and a self-hosted instance, copy the data with the REST API or an SDK.

The REST API can read and create these records:

- contacts, with their MRR, their LTV and their custom attributes,
- tags,
- posts,
- release notes,
- testimonials.

The REST API cannot copy all the data of a project:

- It has no endpoints for boards, stages, votes, comments, attachments, settings and webhooks.
- A post that the API creates has no author and is not published. Publish it in the dashboard.
- Each record gets a new ID on the new instance. Your script must map the old tag IDs to the new tag IDs.

Read [API overview](../api/overview.md) and [Posts](../api/posts.md).

After the move, the URLs and the keys of the project change. Update these items in your app and in your tools:

1. The base URL of the REST API and of the SDKs.
2. The API tokens. Make new tokens in **Settings > API Tokens** of the new project.
3. The `src` and the `data-client` key of the widget script.
4. The identity secret on your server.
5. The MCP server URL and the token in your AI clients.
6. The webhooks and the Slack settings. Configure them again in the new project.
7. The links to the public site.

A self-hosted project can use your own domain. Cloud has no custom domains, so the public site of a project that moves to Cloud gets a new URL.

TODO(owner): Will the Feedback Pilgrim team copy a project between Cloud and a self-hosted instance for a customer?
