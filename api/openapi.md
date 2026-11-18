---
title: OpenAPI and Postman
description: Get the OpenAPI spec and the Postman collection of the API, and import them in Postman, Insomnia or Bruno.
order: 9
---

# OpenAPI and Postman

The API has an OpenAPI 3.1 spec and a Postman collection. Both cover the REST API (`/api/public/v1`) and the widget init call (`/api/v1/init`).

## Where the files are

The app repository has the files in `docs/api/`:

| File | What it holds |
|---|---|
| `docs/api/openapi.yaml` | The OpenAPI 3.1 spec. The maintainers write it by hand. |
| `docs/api/postman_collection.json` | The Postman collection (v2.1), made from the spec. |
| `docs/api/postman_environment.json` | A Postman environment with placeholder values. |

Each instance also serves the files on the dashboard host. You do not need an account to get them.

| Path | What it returns |
|---|---|
| `/documentation/reference` | The API reference as a web page, with request examples. |
| `/documentation/openapi.json` | The spec as JSON. |
| `/documentation/openapi/download` | The spec as a file download. |
| `/documentation/postman/download` | The Postman collection as a file download. |

The **Settings > API Tokens** page also has a link to the Postman collection.

## The keys in the spec

Each operation of the spec names the key that it needs:

| Security scheme | Key | Operations |
|---|---|---|
| `apiToken` | An API token. Read [Authentication](authentication.md). | All operations of `/api/public/v1` |
| `publishableKey` | The publishable key of the project. Read [Widget init](widget.md). | `POST /api/v1/init` only |

The server URL of the spec is the `{baseUrl}` variable. Set it to the URL of your instance, for example `https://feedback.example.com`. The paths of the spec start with `/api/`.

## The variables

The collection and the environment use these variables:

| Variable | Set it to |
|---|---|
| `baseUrl` | The URL of your instance, with no slash at the end, for example `https://feedback.example.com`. |
| `token` | Your API token. All requests send it, except the widget init request. |
| `publishableKey` | The publishable key of the project. Only the widget init request sends it. |

The environment file has placeholder values only. Replace them before you send a request.

## Import in Postman

1. In Postman, click **Import**.
2. Select `postman_collection.json`.
3. Click **Import** again, and select `postman_environment.json`.
4. Open the environment **Feedback Pilgrim**.
5. Set `baseUrl`, `token` and `publishableKey`.
6. Select the environment in the environment menu.

The collection has one folder for each tag of the spec: Init, Widget, Posts, Release Notes, Contacts, Testimonials and Tags. The optional query parameters are off. Turn on the parameters that you need.

## Import in Insomnia

1. In Insomnia, click **Import**.
2. Select `postman_collection.json` or `openapi.yaml`. Insomnia reads both formats.
3. Open the environment of the new collection.
4. Set `baseUrl` and `token`.

## Import in Bruno

1. In Bruno, click **Import Collection**.
2. Select **Postman Collection** and the file `postman_collection.json`. You can also select **OpenAPI V3 Spec** and the file `openapi.yaml`.
3. Select a folder for the collection.
4. Make an environment with the variables `baseUrl` and `token`.

## Keep the files current

If you change the API of the app, read `CONTRIBUTING.md` of the app. In short:

1. Change `docs/api/openapi.yaml`.
2. Run `composer api-docs`. The script makes the JSON copy of the spec and the Postman files again.
3. Commit all the files together.

The CI of the app fails when the generated files do not match the spec. A test of the app fails when an API route has no operation in the spec, or when an operation has no route.
