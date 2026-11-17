---
title: Release process
description: How a new version of Feedback Pilgrim is made and published.
order: 4
---

# Release process

The `main` branch of the app has no version tags, no changelog and no release workflow. The Docker image is built on the server of each operator from the `Dockerfile`. This page has the facts that the code gives, and the questions for the maintainer.

## What the code gives

- The MCP server reports the version `1.0.0`. The value is in the `#[Version]` attribute of `App\Mcp\Servers\PublicServer`.
- The OpenAPI document reports the version `1.0.0` in `info.version`.
- The REST API has the version in its path: `/api/public/v1`.
- The `web` service runs the new migrations at start. Thus an update is `git pull` and `docker compose up -d --build`. Read [Upgrading](../getting-started/upgrading.md).

## Open questions

TODO(owner): The `main` branch has no tags. How do you number the versions of the app, and when do you make a tag?

TODO(owner): The `main` branch has no changelog. Where will you list the changes and the breaking changes of each version?

TODO(owner): No image is published on `main`. Will a release publish a Docker image, and with which tags?

TODO(owner): The MCP server and the OpenAPI document both say `1.0.0`. Do these versions follow the version of the app, or do they change only when the API contract changes?

TODO(owner): Which checks must pass before a release, and who approves it?
