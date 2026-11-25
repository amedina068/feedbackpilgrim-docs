#!/usr/bin/env node
// Writes llms.txt and llms-full.txt at the root of this repository.
//
// llms.txt lists each page with its description, in the order of the "Pages"
// list of README.md. llms-full.txt holds the text of all these pages in one
// file. AI agents read the two files from their raw GitHub URLs.
//
// Usage: node scripts/build-llms.mjs [--check]
// With --check, the script writes nothing. It exits with code 1 when a file
// is not current. No dependencies. Node 20 or later.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const REPO = 'https://github.com/amedina068/feedbackpilgrim-docs';
const RAW = 'https://raw.githubusercontent.com/amedina068/feedbackpilgrim-docs/main';
const APP_RAW = 'https://raw.githubusercontent.com/amedina068/feedbackpilgrim/main';

/** Splits a page into its front matter fields and its body. */
function parsePage(path) {
  const text = readFileSync(path, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  const fields = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const field = line.match(/^(\w+):\s*(.*)$/);
      if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, '');
    }
  }
  return { fields, body: (match ? text.slice(match[0].length) : text).trim() };
}

/** Reads the sections and the page links of the "Pages" list in README.md. */
function readIndex() {
  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  const start = readme.indexOf('## Pages');
  const end = readme.indexOf('\n## ', start + 1);
  const sections = [];
  for (const line of readme.slice(start, end).split('\n')) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      sections.push({ title: heading[1].trim(), pages: [] });
      continue;
    }
    const link = line.match(/^- \[(.+?)\]\((.+?\.md)\)/);
    if (link && sections.length > 0) {
      if (!existsSync(join(root, link[2]))) {
        throw new Error(`README.md links to a missing page: ${link[2]}`);
      }
      sections.at(-1).pages.push({ title: link[1], path: link[2] });
    }
  }
  return sections;
}

function build() {
  const short = [
    '# Feedback Pilgrim',
    '',
    '> Feedback Pilgrim is a self-hosted feedback board. Customers post feature requests, vote and comment on a public site for each project. The team sorts the requests by the revenue of the customers who ask for them.',
    '',
    'Install it with one command: `docker run -d --name feedbackpilgrim -p 8080:8080 -v feedbackpilgrim:/data ghcr.io/amedina068/feedbackpilgrim`. Then open the setup URL on the last line of `docker logs feedbackpilgrim`.',
    '',
    `An AI agent that installs the app must follow ${APP_RAW}/INSTALL.md.`,
    '',
  ];
  const full = [
    '# Feedback Pilgrim documentation',
    '',
    `This file holds all the pages of ${REPO}. The short index is ${RAW}/llms.txt.`,
    '',
  ];

  for (const section of readIndex()) {
    short.push(`## ${section.title}`, '');
    for (const page of section.pages) {
      const { fields, body } = parsePage(join(root, page.path));
      const description = fields.description ? `: ${fields.description}` : '';
      short.push(`- [${fields.title || page.title}](${RAW}/${page.path})${description}`);
      full.push('---', '', `Source: ${RAW}/${page.path}`, '', body, '');
    }
    short.push('');
  }

  return {
    'llms.txt': `${short.join('\n').trimEnd()}\n`,
    'llms-full.txt': `${full.join('\n').trimEnd()}\n`,
  };
}

let stale = false;
for (const [name, content] of Object.entries(build())) {
  const path = join(root, name);
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (current === content) continue;
  if (check) {
    console.error(`${name} is not current. Run: node scripts/build-llms.mjs`);
    stale = true;
  } else {
    writeFileSync(path, content);
    console.log(`Wrote ${name}`);
  }
}
process.exit(stale ? 1 : 0);
