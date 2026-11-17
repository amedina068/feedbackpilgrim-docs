---
title: OpenAPI and Postman
description: Get the OpenAPI document and the Postman collection of the REST API from your instance.
order: 9
---

# OpenAPI and Postman

Each instance serves an OpenAPI document and a Postman collection of the REST API. You do not need an account to get them.

## The OpenAPI document

| Path | What it returns |
|---|---|
| `/documentation/reference` | The API reference as a web page, with request examples. |
| `/documentation/openapi.json` | The OpenAPI 3.1 document as JSON. |
| `/documentation/openapi/download` | The same document as a file download. |

These paths are on the dashboard host, for example `https://feedback.example.com/documentation/openapi.json`.

The document says that the server URL is `/api/public/v1` on the current host. The security scheme is `bearerAuth` (HTTP bearer).

The document is hand-written. It is the file `public/docs/openapi.json` in the app repository. A test of the app compares it with the validation rules and the MCP tool schemas.

The OpenAPI document and the code do not agree on two points. The code is correct:

- The document describes a list response with `links` and `meta` objects. The code returns the flat Laravel pagination object. Read [API overview](overview.md#lists-and-pagination).
- The example `auth_url` of `/init` has the path `/authenticate-contact`. The real path is `/authenticate/{uuid}`.

## The Postman collection

Download the collection from `/FeedbackPilgrimPublicAPI.postman_collection.json` on the dashboard host. The **Settings > API Tokens** page has a link to it.

The collection has a folder for each resource: Init, Contacts, Posts, Release Notes, Testimonials and Tags. Its requests use these collection variables:

| Variable | Set it to |
|---|---|
| `apiBaseUrl` | The base URL of your instance, for example `https://feedback.example.com/api/public/v1`. The file has a development host. |
| `apiToken` | Your API token. |
| `contactId`, `postId`, `releaseNoteId`, `testimonialId`, `tagId` | The IDs of records in your project. |

The collection sends the token as a bearer token. Its update requests use `PUT`.

After the import, set `apiBaseUrl` and `apiToken` before you send a request.
