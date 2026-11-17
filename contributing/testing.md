---
title: Testing
description: Run the PHP and JavaScript tests of Feedback Pilgrim, and learn which tests guard which rules.
order: 3
---

# Testing

## Run the tests

Run all the PHP tests:

```bash
php artisan test
```

Run one test class or method:

```bash
php artisan test --filter=WebhookTest
```

Run the JavaScript tests:

```bash
npm run test:js
```

Format the PHP code:

```bash
vendor/bin/pint
```

## The test environment

The tests use PHPUnit and the values in `phpunit.xml`. You do not need MySQL or Redis.

| Variable | Value in `phpunit.xml` |
|---|---|
| `DB_CONNECTION` | `sqlite` |
| `DB_DATABASE` | `:memory:` |
| `CACHE_DRIVER` | `array` |
| `QUEUE_CONNECTION` | `sync` |
| `SESSION_DRIVER` | `array` |
| `MAIL_MAILER` | `array` |
| `APP_DOMAIN` | `localhost` |
| `APP_URL` | `http://localhost` |
| `REGISTRATION_ENABLED` | `false` |
| `BCRYPT_ROUNDS` | `4` |

## Where the tests are

| Folder | Content |
|---|---|
| `tests/Feature` | Request and response tests, for example the public API, the widget, the MCP server, the tenancy rules and the commands. |
| `tests/Unit` | Tests for classes without HTTP, for example the actions, the rules and the models. |
| `tests/js` | Node tests for the widget and the Blade templates. |

## Tests that guard a rule

| Test | Rule |
|---|---|
| `tests/Feature/Mcp/ContractTest.php` | The validation rules, the MCP tool schemas and `public/docs/openapi.json` agree. |
| `tests/Feature/RouteNamesTest.php` | Each route name is unique, so that `php artisan optimize` can cache the routes. |
| `tests/Feature/DocumentationTest.php` | The guides and the API reference at `/documentation` work. |
| `tests/js/pilgrim-origin.test.mjs` | The widget builds the `init` URL from the host of its own script tag. |
| `tests/js/server-template.test.mjs` | The Blade views use no Vue text interpolation. |

## Write a test

- Every change needs a test. Write the test first when you add behavior.
- Put request and response tests in `tests/Feature`. Put tests for classes without HTTP in `tests/Unit`.
- Use the model factories and the `RefreshDatabase` trait.
- Name a test after the behavior that it checks, for example `test_onboarding_creates_the_admin_contact_for_the_new_client`.

## Before a pull request

Make sure that these commands pass:

```bash
php artisan test
vendor/bin/pint --test
npm run build
```

TODO(owner): The app `CONTRIBUTING.md` says that the CI runs `vendor/bin/pint --test`, but the `main` branch has no CI workflow. Which checks will the CI of the app run?
