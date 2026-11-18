---
title: Tags
description: Label posts, contacts and release notes with the tags of a project.
order: 5
---

# Tags

A tag is a label in a project. You can put tags on posts, contacts and release notes. The title of a tag is unique in a project.

## Manage tags in the dashboard

Open **Tags** in the sidebar. The list shows the number of posts and contacts of each tag. You can create a tag, and open a tag to see its posts and contacts.

Use tags to filter:

- the **Posts** list,
- the **Contacts** list.

A contact can choose tags of the project when they write a post on the public site.

## Tags in the REST API and the MCP server

The REST API and the MCP server can list, create, rename and delete tags. Read [Tags](../api/tags.md) in the API section.

- To set the tags of a record, send `tags` with a list of tag IDs. The list replaces all the tags of the record.
- To filter a list of posts, contacts or release notes, send `tag` with the title of a tag.

The REST API and the MCP server can delete a tag. The app first removes the tag from its posts, contacts and release notes. Then it deletes the tag.

TODO(owner): The dashboard has routes to create and show a tag, but no route to rename or delete a tag. Is rename and delete in the dashboard planned?
