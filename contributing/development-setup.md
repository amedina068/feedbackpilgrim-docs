---
title: Development setup
description: Run Feedback Pilgrim on your computer for development.
order: 2
---

# Development setup

## Requirements

- PHP 8.3 with the `pdo_mysql`, `redis`, `gd` and `exif` extensions
- Composer
- Node.js 24
- MySQL
- Redis

The tests do not need MySQL or Redis. Read [Testing](testing.md).

## Install

1. Clone the repository and go into its folder.
2. Install the dependencies:

   ```bash
   composer install
   npm install
   ```

3. Create the environment file and the key:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Set these values in `.env`:

   | Variable | Value |
   |---|---|
   | `APP_ENV` | `local` |
   | `APP_DEBUG` | `true` |
   | `APP_DOMAIN` | `localhost` |
   | `APP_URL` | `http://localhost:8000` |
   | `SESSION_DOMAIN` | `null` |
   | `SESSION_SECURE_COOKIE` | `false` |

5. Create the tables and the example data:

   ```bash
   php artisan migrate --seed
   ```

6. Start Vite:

   ```bash
   npm run dev
   ```

7. In a second terminal, start the app:

   ```bash
   php artisan serve
   ```

8. If your change uses queued jobs, start a worker in a third terminal:

   ```bash
   php artisan queue:work
   ```

## The example data

The seeders create the user `test@example.com` with the password `password`.

Browsers send `*.localhost` to your own computer. Thus the public site of a seeded project is at `http://<slug>.localhost:8000`.

## Commands

| Command | Use |
|---|---|
| `php artisan test` | Run all the PHP tests. |
| `php artisan test --filter=SomeTest` | Run one test class or method. |
| `npm run test:js` | Run the JavaScript tests. |
| `vendor/bin/pint` | Format the PHP code. |
| `npm run dev` | Start Vite with hot reload. |
| `npm run build` | Build the dashboard assets (`public/build`) and the widget (`public/pilgrim.js`). |
| `php artisan migrate` | Run the migrations. |
| `php artisan db:seed` | Add the example data. |

## Rules for a change

The app repository has its own `CONTRIBUTING.md`. These are the main rules:

- Write the test first when you add behavior.
- Format the PHP code with Laravel Pint.
- Use explicit return types and parameter types.
- Use `env()` only in `config/`. Use `config()` everywhere else.
- Style the UI with Tailwind CSS classes and the `fp-*` theme tokens.
- Read `DESIGN_SYSTEM.md` before a UI change.
- Update `ARCHITECTURE.md` in the same pull request when a change affects the architecture. Examples are the data model, a request surface, the tenancy rules, an auth guard and a build target.
- Do not use Vue text interpolation in Blade views. Use props or a `.vue` component. The test `tests/js/server-template.test.mjs` checks this rule.

## Security problems

Do not open a public issue for a security problem. Use the security advisory form of the repository.
