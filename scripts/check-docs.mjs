#!/usr/bin/env node
// Checks the Markdown pages of this repository.
//
// 1. Each page has front matter with `title`, `description` and `order`.
// 2. Each internal link resolves to a page, and each anchor to a heading.
// 3. Each `php artisan <command>` in a page exists in the app.
// 4. Each environment variable in the code of a page exists in the app.
// 5. Each endpoint on an API page is an operation of the OpenAPI spec of the
//    app, and each operation of the spec is on an API page.
//
// Checks 3, 4 and 5 need the source of the app. Set FEEDBACKPILGRIM_APP_PATH to
// the app folder. If FEEDBACKPILGRIM_APP_PATH is not set, the script runs
// checks 1 and 2 only. Check 5 reads `public/docs/openapi.json` of the app,
// the JSON copy of `docs/api/openapi.yaml`. If the app folder has `vendor/`, the script reads the
// commands from `php artisan list`. If not, it reads the signatures in
// `app/Console/Commands` and a fixed list of framework commands.
//
// Usage: node scripts/check-docs.mjs [--links-only]
// No dependencies. Node 20 or later.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const linksOnly = process.argv.includes('--links-only');
const appPath = linksOnly ? null : process.env.FEEDBACKPILGRIM_APP_PATH || null;

// Folders that hold no published pages.
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts']);
// Files at the root that are not pages, so they need no front matter.
const NON_PAGES = new Set(['README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md']);

// Environment variables that the app does not read, but that a page names
// on purpose. Each entry says who reads it.
const EXTERNAL_ENV = new Map([
  ['CLOUDFLARE_API_TOKEN', 'read by Caddy in the reverse proxy example, not by the app'],
  ['FEEDBACKPILGRIM_APP_PATH', 'read by the scripts of this repository'],
  ['FP_TOKEN', 'read by the shell of the MCP client in the lines of fp:mcp:connect, not by the app'],
  ['COMPOSE_PROFILES', 'read by Docker Compose, not by the app'],
  // The SDK page names these variables. The SDKs and the apps of the reader
  // read them, not the Feedback Pilgrim app.
  ['FEEDBACKPILGRIM_URL', 'read by the Python and Ruby SDKs and by the Laravel config of the PHP SDK'],
  ['FEEDBACKPILGRIM_TOKEN', 'read by the Python and Ruby SDKs and by the Laravel config of the PHP SDK'],
  ['FEEDBACKPILGRIM_IDENTITY_SECRET', 'read by the Ruby SDK and by the Laravel config of the PHP SDK'],
  ['FEEDBACKPILGRIM_WEBHOOK_SECRET', 'read by the Ruby SDK and by the Laravel config of the PHP SDK'],
  ['FEEDBACKPILGRIM_WEBHOOK_TOLERANCE', 'read by the Laravel config of the PHP SDK'],
  ['FEEDBACKPILGRIM_TIMEOUT', 'read by the Laravel config of the PHP SDK'],
  ['FEEDBACKPILGRIM_RETRIES', 'read by the Laravel config of the PHP SDK'],
  // The SDK page names these Node.js error codes. They are not environment
  // variables, but they have the same form.
  ['EAI_AGAIN', 'a Node.js DNS error code on the SDK page'],
  ['UND_ERR_CONNECT_TIMEOUT', 'a Node.js connect timeout error code on the SDK page'],
]);

// Framework commands that the fallback mode accepts when `vendor/` is missing.
const FRAMEWORK_COMMANDS = [
  'about', 'config:cache', 'config:clear', 'db:seed', 'down', 'key:generate',
  'list', 'mcp:inspector', 'migrate', 'migrate:fresh', 'migrate:rollback', 'migrate:status',
  'optimize', 'optimize:clear', 'queue:failed', 'queue:restart', 'queue:retry',
  'queue:work', 'route:cache', 'route:clear', 'route:list', 'schedule:list',
  'schedule:run', 'schedule:work', 'serve', 'storage:link', 'test', 'tinker',
  'up', 'view:cache', 'view:clear', 'vendor:publish', 'package:discover',
];

// The pages write a REST API path without its prefix, for example `/posts/{id}`.
const API_PREFIX = '/api/public/v1';
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const errors = [];
const warnings = [];
const fail = (file, line, message) => errors.push(`${relative(root, file)}:${line}: ${message}`);

// ---------------------------------------------------------------------------
// Collect the pages
// ---------------------------------------------------------------------------

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    // A hidden folder holds no page. The CI clones the app into `.app`.
    if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

const files = walk(root).sort();
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

// ---------------------------------------------------------------------------
// Helpers for Markdown
// ---------------------------------------------------------------------------

/** Splits a page into lines and marks the lines that are in a fenced code block. */
function lines(text) {
  let fence = null;
  return text.split('\n').map((line, index) => {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    let inCode = fence !== null;
    if (match) {
      if (fence === null) {
        fence = match[1];
        inCode = true;
      } else if (match[1][0] === fence[0] && match[1].length >= fence.length) {
        fence = null;
        inCode = true;
      }
    }
    return { number: index + 1, text: line, inCode };
  });
}

/** The heading slug that GitHub and most Markdown renderers make. */
function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[`*~[\]()]/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

const anchorCache = new Map();
function anchors(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const seen = new Map();
  const set = new Set();
  for (const line of lines(sources.get(file) ?? readFileSync(file, 'utf8'))) {
    if (line.inCode) continue;
    const match = line.text.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!match) continue;
    const base = slug(match[1]);
    const count = seen.get(base) ?? 0;
    set.add(count === 0 ? base : `${base}-${count}`);
    seen.set(base, count + 1);
  }
  anchorCache.set(file, set);
  return set;
}

/** Inline code spans of a line that is not in a code block. */
function inlineCode(text) {
  return [...text.matchAll(/(`+)(.+?)\1/g)].map((m) => m[2]);
}

// ---------------------------------------------------------------------------
// Check 1: front matter
// ---------------------------------------------------------------------------

for (const [file, text] of sources) {
  if (NON_PAGES.has(relative(root, file))) continue;
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(file, 1, 'front matter is missing');
    continue;
  }
  for (const field of ['title', 'description', 'order']) {
    if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(match[1])) {
      fail(file, 1, `front matter has no "${field}"`);
    }
  }
  if (!/^order:\s*\d+\s*$/m.test(match[1])) fail(file, 1, '"order" is not an integer');
}

// ---------------------------------------------------------------------------
// Check 2: internal links and anchors
// ---------------------------------------------------------------------------

let linkCount = 0;
for (const [file, text] of sources) {
  for (const line of lines(text)) {
    if (line.inCode) continue;
    const withoutCode = line.text.replace(/(`+).+?\1/g, '');
    for (const match of withoutCode.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, https:, mailto:
      linkCount++;
      const [pathPart, anchor] = target.split('#');
      const targetFile = pathPart === '' ? file : resolve(dirname(file), pathPart);
      if (!existsSync(targetFile)) {
        fail(file, line.number, `link target does not exist: ${target}`);
        continue;
      }
      if (statSync(targetFile).isDirectory()) {
        fail(file, line.number, `link points to a folder, not a page: ${target}`);
        continue;
      }
      if (anchor && targetFile.endsWith('.md') && !anchors(targetFile).has(anchor)) {
        fail(file, line.number, `anchor "#${anchor}" is not a heading in ${relative(root, targetFile)}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Checks 3 and 4: commands and environment variables
// ---------------------------------------------------------------------------

let commandCount = 0;
let envCount = 0;
let endpointCount = 0;

if (appPath) {
  if (!existsSync(join(appPath, 'artisan'))) {
    console.error(`FEEDBACKPILGRIM_APP_PATH does not point to the app: ${appPath}`);
    process.exit(2);
  }

  const commands = loadCommands(appPath);
  const env = loadEnvKeys(appPath);

  for (const [file, text] of sources) {
    for (const line of lines(text)) {
      // Commands: anywhere in the page, in code or in prose. The commands of
      // the app have names with colons, for example `fp:install` and `fp:user:list`.
      for (const match of line.text.matchAll(/php artisan ([a-z][a-z0-9:_-]*[a-z0-9])/g)) {
        commandCount++;
        if (!commands.has(match[1])) {
          fail(file, line.number, `artisan command does not exist: ${match[1]}`);
        }
      }

      // Environment variables: only in code blocks and inline code.
      const chunks = line.inCode ? [line.text] : inlineCode(line.text);
      for (const chunk of chunks) {
        for (const match of chunk.matchAll(/(::|->|\\)?\b([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)(_\*)?(\.[a-z]+)?/g)) {
          if (match[1]) continue; // a PHP constant or a class name, not a variable
          if (match[4]) continue; // a file name, for example DESIGN_SYSTEM.md
          const name = match[2];
          // A name with no underscore (`TIMEOUT`, `HTTP`) is not a variable, except as a `NAME_*` prefix.
          if (!match[3] && !name.includes('_')) continue;
          envCount++;
          if (match[3]) {
            const prefix = `${name}_`;
            if (![...env].some((key) => key.startsWith(prefix))) {
              fail(file, line.number, `no environment variable starts with ${prefix}`);
            }
            continue;
          }
          if (!env.has(name) && !EXTERNAL_ENV.has(name)) {
            fail(file, line.number, `environment variable is not in the app: ${name}`);
          }
        }
      }
    }
  }

  checkEndpoints(appPath);
} else {
  warnings.push('FEEDBACKPILGRIM_APP_PATH is not set. The command, environment variable and endpoint checks did not run.');
}

// ---------------------------------------------------------------------------
// Check 5: endpoints on the API pages
// ---------------------------------------------------------------------------

/**
 * One key for an endpoint, for example "PATCH /api/public/v1/posts/{}". The
 * names of path parameters and the IDs in example URLs become `{}`. Laravel
 * accepts PUT for each PATCH route, and the spec documents PATCH only.
 */
function endpointKey(method, path) {
  const fullPath = path.startsWith('/api/') ? path : API_PREFIX + path;
  const normalized = fullPath
    .split('?')[0]
    .replace(/\/+$/, '')
    .split('/')
    .map((segment) => (/^\{[^}]+\}$/.test(segment) || /^\d+$/.test(segment) ? '{}' : segment))
    .join('/');
  return `${method === 'PUT' ? 'PATCH' : method} ${normalized}`;
}

/** The endpoints of the spec. The old spec put `/api/public/v1` in `servers`. */
function specEndpoints(spec) {
  const server = spec.servers?.[0]?.url ?? '';
  const prefix = server.startsWith('/') ? server.replace(/\/+$/, '') : '';
  const keys = new Set();
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of Object.keys(item)) {
      if (HTTP_METHODS.includes(method.toUpperCase())) keys.add(endpointKey(method.toUpperCase(), prefix + path));
    }
  }
  return keys;
}

/** The endpoints that a page names: HTTP blocks, table rows and curl commands. */
function pageEndpoints(text) {
  const found = [];
  const add = (number, method, path) => found.push({ number, key: endpointKey(method, path) });
  let fenceLanguage = null;

  for (const line of lines(text)) {
    const fence = line.text.match(/^\s*```(\w*)/);
    if (fence) {
      fenceLanguage = fenceLanguage === null ? fence[1] : null;
      continue;
    }

    if (fenceLanguage === 'http') {
      const request = line.text.match(/^(GET|POST|PUT|PATCH|DELETE) (\/\S*)/);
      if (request) add(line.number, request[1], request[2]);
      continue;
    }

    if (fenceLanguage !== null) {
      const curl = line.text.match(/^curl\s+(?:-X\s+(GET|POST|PUT|PATCH|DELETE)\s+)?['"]?https?:\/\/[^/\s'"]+(\/api\/[^\s'"]*)/);
      if (curl) add(line.number, curl[1] ?? 'GET', curl[2]);
      continue;
    }

    const row = line.text.match(/^\|\s*((?:`(?:GET|POST|PUT|PATCH|DELETE)`(?:,\s*)?)+)\s*\|\s*`(\/[^`]*)`\s*\|/);
    if (row) {
      for (const method of row[1].matchAll(/`(\w+)`/g)) add(line.number, method[1], row[2]);
    }
  }
  return found;
}

function checkEndpoints(app) {
  const specFile = join(app, 'public', 'docs', 'openapi.json');
  if (!existsSync(specFile)) {
    warnings.push('The app has no public/docs/openapi.json, so the endpoint check did not run.');
    return;
  }

  const spec = specEndpoints(JSON.parse(readFileSync(specFile, 'utf8')));
  const documented = new Set();

  for (const [file, text] of sources) {
    if (!relative(root, file).startsWith(`api${sep}`)) continue;
    for (const { number, key } of pageEndpoints(text)) {
      endpointCount++;
      documented.add(key);
      if (!spec.has(key)) fail(file, number, `endpoint is not in the OpenAPI spec of the app: ${key}`);
    }
  }

  for (const key of spec) {
    if (!documented.has(key)) errors.push(`api/: the OpenAPI spec has an endpoint that no API page names: ${key}`);
  }
}

function loadCommands(app) {
  const names = new Set();
  if (existsSync(join(app, 'vendor', 'autoload.php'))) {
    try {
      const json = execFileSync('php', ['artisan', 'list', '--format=json', '--no-ansi'], {
        cwd: app,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      for (const command of JSON.parse(json).commands) names.add(command.name);
      return names;
    } catch (error) {
      warnings.push(`php artisan list failed, so the script used the fallback list: ${error.message.split('\n')[0]}`);
    }
  } else {
    warnings.push('The app has no vendor/ folder, so the script used the fallback command list.');
  }

  for (const name of FRAMEWORK_COMMANDS) names.add(name);

  // A signature can have many lines, for example 'fp:install {--name= : ...}'.
  // The name of the command is the first word of the signature.
  for (const file of listFiles(join(app, 'app', 'Console', 'Commands'), '.php')) {
    const match = readFileSync(file, 'utf8').match(/\$signature\s*=\s*'([^\s']+)/);
    if (match) names.add(match[1]);
  }

  // Closure commands in routes/console.php.
  const consoleRoutes = join(app, 'routes', 'console.php');
  if (existsSync(consoleRoutes)) {
    for (const match of readFileSync(consoleRoutes, 'utf8').matchAll(/Artisan::command\(\s*'([^\s']+)/g)) {
      names.add(match[1]);
    }
  }
  return names;
}

function loadEnvKeys(app) {
  const keys = new Set();
  const add = (regex, text) => {
    for (const match of text.matchAll(regex)) keys.add(match[1]);
  };
  const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');

  // KEY=value lines, also commented out ones.
  add(/^\s*#?\s*([A-Z][A-Z0-9_]*)=/gm, read(join(app, '.env.example')));

  // env('KEY') in config/.
  for (const file of listFiles(join(app, 'config'), '.php')) {
    add(/env\(\s*'([A-Z][A-Z0-9_]*)'/g, read(file));
  }

  // Docker and deploy files: KEY: value, KEY=value and ${KEY}.
  const dockerFiles = [join(app, 'docker-compose.yml'), join(app, 'docker-compose.image.yml'), join(app, 'Dockerfile'), ...listFiles(join(app, 'deploy'))];
  for (const file of dockerFiles) {
    const text = read(file);
    add(/^\s*-?\s*([A-Z][A-Z0-9_]*)\s*[:=]/gm, text);
    add(/\$\{?([A-Z][A-Z0-9_]*)/g, text);
    add(/\b([A-Z][A-Z0-9_]*)=/g, text);
  }

  // The test environment of the app: <env name="KEY" value="..."/>.
  add(/<env\s+name="([A-Z][A-Z0-9_]*)"/g, read(join(app, 'phpunit.xml')));

  // Variables that the tests and the CI of the app read.
  for (const file of listFiles(join(app, 'tests'))) {
    const text = read(file);
    add(/process\.env\.([A-Z][A-Z0-9_]*)/g, text);
    add(/getenv\(\s*'([A-Z][A-Z0-9_]*)'/g, text);
    add(/env\(\s*'([A-Z][A-Z0-9_]*)'/g, text);
  }
  for (const file of listFiles(join(app, '.github', 'workflows'))) {
    add(/^\s*([A-Z][A-Z0-9_]*)\s*:/gm, read(file));
  }

  // env('KEY') in app/ and bootstrap/, if a class reads one directly.
  for (const dir of ['app', 'bootstrap']) {
    for (const file of listFiles(join(app, dir), '.php')) add(/env\(\s*'([A-Z][A-Z0-9_]*)'/g, read(file));
  }
  return keys;
}

function listFiles(dir, extension = '') {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'vendor') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...listFiles(path, extension));
    else if (name.endsWith(extension)) out.push(path);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

for (const warning of warnings) console.warn(`warning: ${warning}`);
for (const error of errors) console.error(error);

console.log(
  `Checked ${files.length} files: ${linkCount} internal links, ` +
    (appPath
      ? `${commandCount} artisan commands, ${envCount} environment variables, ${endpointCount} API endpoints.`
      : 'commands, variables and endpoints skipped.'),
);

if (errors.length > 0) {
  console.error(`${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log('No problems found.');
