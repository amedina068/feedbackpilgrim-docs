# Contributing to the Feedback Pilgrim docs

Thank you for your help. This file gives the rules for a page and for a pull request. Read [README.md](README.md) for the folder structure, the front matter and the checks.

## Facts come from the code

- Each fact on a page must come from the code of the app. Read the code before you write about it.
- Copy the names of commands, environment variables, routes, fields and error messages from the code. Do not type them from memory.
- If the code does not answer a question, do not guess. Write a `TODO(owner):` paragraph (see below).
- If the docs and the code do not agree, the code is correct. Correct the page. If the code looks wrong, open an issue in the app repository.
- Do not copy private planning files or agent files of the app into a page. Examples are `CLAUDE.md`, `AGENTS.md` and `.mcp.json`.
- Document the `main` branch of the app only. A file that is not on `main` is not available to readers.

## The `TODO(owner):` convention

A `TODO(owner):` paragraph is a question for the maintainer. Write it on its own line, in the place where the answer will go:

```markdown
TODO(owner): The code keeps no backups. How many days of backups do you recommend?
```

- Write one question in each paragraph.
- Say what the code shows, then ask the question.
- When the maintainer answers, replace the paragraph with the answer.

## Simple English

Write every page in Simple English, in the style of ASD-STE100 (pragmatic mode). Many readers use translation tools or read English as a second language.

### Procedures (instructions)

- Use the imperative: "Run the migrations."
- Write one instruction in each sentence.
- Write 20 words or fewer in each sentence.
- Put a condition before the command: "If the build fails, read the log."
- Use a numbered list for steps that have an order.

### Descriptions (explanations)

- Use the simple present or the simple past.
- Write 25 words or fewer in each sentence.
- Write one topic in each paragraph, with six sentences or fewer.

### Words

- Use the active voice: "The app stores the key", not "The key is stored".
- Use `can`, `must` and `will`. Do not use `should`, `may`, `might`, `could` or `would`.
- Do not use contractions (`don't`, `it's`) or semicolons.
- Do not use filler words: `simply`, `just`, `easily`, `seamlessly`, `robust`, `leverage`, `utilize`.
- Write "for example" and "that is". Do not write "e.g.", "i.e." or "etc.".
- Write "make sure that" for a check.
- Keep code, commands, file paths and quoted errors exactly as they are. They count as one word.

### Terms

Use one term for one thing. These docs use these terms:

| Term | Meaning |
|---|---|
| Instance | One installation of Feedback Pilgrim. |
| Owner | A user who runs the instance. Only an owner can open `/admin`. |
| Project | One product with its own public site. The code calls a project a "client" (`Client`, `client_id`). Write "project" in prose. Keep `client` in code, fields and routes. |
| Contact | A customer of a project. Contacts post, vote and comment on the public site. |
| Post | One piece of feedback, for example a feature request. |
| Board | A group of posts in a project. |
| Stage | One step of the status pipeline of a post. The dashboard calls a stage a "status". |
| Tag | A label for posts, contacts and release notes. |
| Release note | A changelog entry of a project. |
| Testimonial | A text from a customer, with an optional rating. |
| API token | A personal access token for the REST API and the MCP server. |
| Publishable key | The public `pk_...` key that the widget sends. It is not an API token. |
| Identity secret | The secret that your server uses to sign the email of a user for the widget. |
| Environment variable | A value in `.env`, for example `APP_URL`. |

### Warnings

Start a warning with `WARNING:` (a risk to data or security) or `CAUTION:` (a risk to the instance). Put the instruction first and the risk second.

## Voice

- Write for a person who runs or uses an instance. Use a neutral open-source voice.
- Do not write sales copy, prices or "sign up" text.
- Use the example hosts `feedback.example.com` and `acme.feedback.example.com`.
- Use placeholders like `<your-token>` for secrets.
- Never put a real token, key, password or personal email on a page.

## Code examples

- Give each API endpoint page an example in curl and in PHP.
- Use the Laravel HTTP client in PHP examples.
- Never put an API token or the identity secret in browser code. Only the publishable key is public.

## Pull requests

1. Make one change in each pull request.
2. Run `node scripts/check-docs.mjs`. If you have an app checkout, also set `FEEDBACKPILGRIM_APP_PATH`.
3. Fill in the pull request template.

The CI must pass before a merge.
