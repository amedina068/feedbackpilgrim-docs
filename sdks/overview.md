---
title: SDKs
description: The status of the Feedback Pilgrim SDKs for JavaScript, PHP, Python and Ruby.
order: 1
---

# SDKs

SDKs for JavaScript, PHP, Python and Ruby are in progress. They are not available yet. Until they are available, call the REST API with an HTTP client. Read [API overview](../api/overview.md).

## What the SDKs will do

Each SDK is a server-side client for one instance. The plan for the first version is:

- A client that takes the URL of your instance and an API token.
- A method for each operation of the REST API: init, posts, release notes, contacts, testimonials and tags.
- A typed error for each error status: `401`, `404`, `405`, `422` and `429`.
- Retries with backoff after `429` and after server errors.
- A helper that reads all the pages of a list.
- A helper that makes the identity hash (`user_hash`) for the widget. Read [Widget init](../api/widget.md#the-identity-hash).
- A helper that verifies the `X-FeedbackPilgrim-Signature-V2` and `X-FeedbackPilgrim-Timestamp` headers of a webhook. Read [Verify the signature](../using-feedback-pilgrim/webhooks-and-slack.md#verify-the-signature).

The SDKs do not call `POST /api/v1/init`. The widget script calls it from the browser.

## Until the SDKs are ready

- Import the Postman collection to try the API. Read [OpenAPI and Postman](../api/openapi.md).
- Make a client from the OpenAPI spec with a generator for your language.

TODO(owner): The SDKs are not released. Which package names will the SDKs use, and on which registries (npm, Packagist, PyPI, RubyGems) will you publish them?
