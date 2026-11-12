# Get Pro Edge Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-page static site with the Get Pro Edge website: 11 Astro pages plus contact and support forms that create Zammad tickets through n8n, ready to deploy on Cloudflare Pages at getproedge.org.

**Architecture:** Astro 7 builds static pages from one layout, one stylesheet and four data files. Two Cloudflare Pages Functions (`/api/contact`, `/api/support`) each check a honeypot and Cloudflare Turnstile. They validate the fields with rules shared with the browser, then forward the form as multipart to an n8n webhook. n8n creates the Zammad ticket over the server's internal Docker network and returns the ticket number.

**Tech Stack:** Astro 7.4.11, @astrojs/sitemap 3.7.4, TypeScript 5.9.3, @astrojs/check 0.9.12, Vitest 5.1.0, @types/node 24.19.2, Cloudflare Pages + Pages Functions, Cloudflare Turnstile, n8n 2.43 (server), Zammad (server).

**Spec:** `docs/superpowers/specs/2026-11-12-getproedge-website-design.md` (read it with this plan).

## Global Constraints

- Work in `D:\-- Progressive Edge LLC\pe-website` on branch `feature/getproedge-site`. The path has spaces and a leading `--`, so always quote it. Commands are bash (Git Bash), run from the repo root unless a step says PowerShell.
- Commit with the repo-local identity that is already set ("Progressive Edge" <340405422+ProgressiveEdge@users.noreply.github.com>). Never change git config. End every commit message with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Stage only the files a task names. Never `git add -A` or `git add .`.** The owner has two things that must not be committed: an uncommitted edit in `support/request.html` and an untracked `docs/superpowers/plans/2026-10-14-support-request-form.md`.
- **Do not push** until Task 17, and only with the owner's go-ahead.
- Save every file as UTF-8 **without BOM**. Use the Write tool or a bash heredoc. Never use PowerShell 5.1 `Set-Content`/`Out-File -Encoding utf8`: they add a BOM, and a BOM in `package.json` breaks the Astro build.
- Exact versions, pinned without `^`: astro 7.4.11, @astrojs/sitemap 3.7.4, @astrojs/check 0.9.12, typescript 5.9.3, vitest 5.1.0, @types/node 24.19.2.
- Node: `.nvmrc` is `24`, and Cloudflare uses `NODE_VERSION=24`. Local Node 25 works but npm prints an `EBADENGINE` warning for vitest; ignore it.
- Identity (spec §2):
  - Brand: "Get Pro Edge", endorsement "a Progressive Edge company".
  - Legal name: "Progressive Edge LLC", a Michigan limited liability company.
  - Location shown: "Auburn, Michigan" (city and state only).
  - Phone: "(989) 200-4814", linked as `tel:+19892004814`.
  - Email: `info@getproedge.org`.
  - Reply promise: "We reply within one business day."
  - Tagline: "ai / technology / people".
- Contact details come only from `src/config/site.ts`. Service, team and values copy come only from `src/data/*`.
- Never publish:
  - Ownership split, capital contributions, home addresses, the mediator list, or buyout and other operating-agreement terms.
  - "Kemp Technology Group" or "Boopify Creative".
  - Past employers or schools.
  - Invented statistics, client names, logos or testimonials.
- Never reference `portal.getproedge.org` (it is reserved), and never change the Entra sign-in gate.
- URLs have no trailing slash and no `.html` (`trailingSlash: 'never'`, `build.format: 'file'`). Internal links are root-relative, for example `/about`.
- Tokens:
  - ink #0F1420, ink-2 #162035, ink-3 #1D2B45
  - slate #334155, silver #848D9B, silver-light #C3CAD4
  - ice #2F8FA8, ice-light #9AE8F7
  - paper #F6F8FB
  - copper #C0623A, copper-light #F0A27A
  - copper-button #AD5634, for the button background only
- Fonts: Michroma (wordmark and numerals), Jura (headings), Quantico (body).
- Contrast:
  - Use `--silver` text only on ink or ink-2 backgrounds. On ink-3, use `--silver-light`.
  - Copper text appears only as `--copper-light`.
  - Form-field borders use `--silver` so they meet 3:1.
- Accessibility: WCAG 2.1 AA.
  - Visible focus, a skip link, and landmarks.
  - Labelled fields whose errors are announced.
  - 44px touch targets, and no horizontal scroll at 320px.
  - No motion under `prefers-reduced-motion: reduce`.
  - All content stays visible with JavaScript off.
- The form handlers never log submitted fields or files.

## File Map

| Path | Responsibility |
|---|---|
| `package.json`, `package-lock.json`, `.nvmrc`, `.gitignore` | Toolchain (Task 1) |
| `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts` | Build, type-check and test config (Task 1) |
| `scripts/check-dist.mjs` | Checks `dist/`: broken internal links, URL style, banned text (Task 1) |
| `src/lib/paths.ts` | `cleanPath`, `isCurrent` — Astro reports `/x.html` at build time (Task 1) |
| `functions/_lib/validate.ts` | Field rules, choice lists, file limits; shared by server and browser (Task 2) |
| `functions/_lib/turnstile.ts` | `verifyTurnstile` (Task 3) |
| `functions/_lib/forward.ts` | `forwardToN8n` (Task 4) |
| `functions/_lib/handle.ts` | `handleSubmission`, the full request pipeline (Task 5) |
| `functions/api/contact.ts`, `functions/api/support.ts` | Pages Function entry points (Task 5) |
| `tests/**` | Vitest unit tests (Tasks 1–6, 15) |
| `src/config/site.ts` | Identity, contact details, booking URL, Turnstile site key (Task 6) |
| `src/data/services.ts`, `team.ts`, `values.ts` | All page copy for services, founders, values (Task 6) |
| `src/assets/team/david.webp`, `stacey.webp` | Headshot originals (already copied into place; Task 6) |
| `src/styles/site.css` | Tokens, base, every component style (Task 7) |
| `src/layouts/Base.astro` | `<head>`, meta/OG/JSON-LD, skip link, Nav, Footer (Task 7) |
| `src/components/Wordmark.astro`, `BookingLink.astro`, `Nav.astro`, `Footer.astro` | Site chrome (Task 7) |
| `src/scripts/nav.ts`, `reveal.ts` | Mobile menu, scroll reveal (Task 7) |
| `public/icons/*`, `public/robots.txt`, `public/_redirects` | Static files (Task 7) |
| `src/components/PageHeader.astro`, `SectionHeading.astro`, `ServiceCard.astro`, `Steps.astro`, `FounderCard.astro`, `Faq.astro`, `ContactMethods.astro`, `CtaBand.astro` | Shared sections (Task 8) |
| `src/pages/index.astro` | Home (Task 8) |
| `src/pages/services/index.astro`, `src/pages/services/[slug].astro` | Services (Task 9) |
| `src/pages/about.astro` | About (Task 10) |
| `src/scripts/forms.ts`, `contact-form.ts`, `src/pages/contact.astro` | Contact (Task 11) |
| `src/scripts/support-form.ts`, `src/pages/support.astro` | Support (Task 12) |
| `src/pages/privacy.astro`, `src/pages/404.astro` | Privacy, Not found (Task 13) |
| `scripts/og/og-image.html`, `scripts/og/mark.png`, `public/og-image.png` | Social share image (Task 14) |
| `n8n/contact-to-zammad.json`, `n8n/support-to-zammad.json` | Importable n8n workflows (Task 15) |
| `docs/setup.md` | Owner setup steps (Task 16) |
| `index.html`, `support/request.html`, `CNAME` | Removed (Task 16) |

---

### Task 1: Project scaffold and build checks

**Files:**
- Create: `package.json`, `.nvmrc`, `.gitignore`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/lib/paths.ts`, `src/pages/index.astro` (temporary), `scripts/check-dist.mjs`
- Generated: `package-lock.json`
- Test: `tests/paths.test.ts`

**Interfaces:**
- Produces: `cleanPath(pathname: string): string` and `isCurrent(pathname: string, href: string): boolean` from `src/lib/paths.ts`; npm scripts `build`, `check`, `test`, `check:dist`, `verify`.

- [ ] **Step 1: Write the toolchain files**

`package.json`:

```json
{
  "name": "getproedge-site",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "check:dist": "node scripts/check-dist.mjs",
    "verify": "npm run check && npm test && npm run build && npm run check:dist"
  },
  "dependencies": {
    "@astrojs/sitemap": "3.7.4",
    "astro": "7.4.11"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.12",
    "@types/node": "24.19.2",
    "typescript": "5.9.3",
    "vitest": "5.1.0"
  }
}
```

`.nvmrc`:

```
24
```

`.gitignore`:

```
node_modules/
dist/
.astro/
.wrangler/
```

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://getproedge.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') })],
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Install**

Run: `npm install --no-audit --no-fund`
Expected: `added NNN packages`; `package-lock.json` created. An `EBADENGINE` warning on Node 25 is fine.

- [ ] **Step 3: Write the failing test**

`tests/paths.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { cleanPath, isCurrent } from '../src/lib/paths';

describe('cleanPath', () => {
  it.each([
    ['/index.html', '/'],
    ['/', '/'],
    ['/services.html', '/services'],
    ['/services', '/services'],
    ['/services/', '/services'],
    ['/services/managed-it.html', '/services/managed-it'],
    ['/404.html', '/404'],
  ])('%s -> %s', (input, expected) => {
    expect(cleanPath(input)).toBe(expected);
  });
});

describe('isCurrent', () => {
  it('matches the page itself', () => {
    expect(isCurrent('/about.html', '/about')).toBe(true);
  });
  it('matches a child page of a section', () => {
    expect(isCurrent('/services/websites.html', '/services')).toBe(true);
  });
  it('does not match a different page', () => {
    expect(isCurrent('/support.html', '/services')).toBe(false);
  });
  it('does not match on a shared prefix alone', () => {
    expect(isCurrent('/servicesx.html', '/services')).toBe(false);
  });
});
```

- [ ] **Step 4: Run it to make sure it fails**

Run: `npx vitest run tests/paths.test.ts`
Expected: FAIL — cannot resolve `../src/lib/paths`.

- [ ] **Step 5: Implement**

`src/lib/paths.ts`:

```ts
/**
 * With build.format "file", Astro.url.pathname ends in ".html" during a build
 * ("/index.html", "/services.html") but not in dev. Returns the public path:
 * "/", "/services", "/services/managed-it".
 */
export function cleanPath(pathname: string): string {
  const path = pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

/** True when `href` is the current page or a section that contains it. */
export function isCurrent(pathname: string, href: string): boolean {
  const path = cleanPath(pathname);
  return path === href || path.startsWith(`${href}/`);
}
```

- [ ] **Step 6: Run it to make sure it passes**

Run: `npx vitest run tests/paths.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 7: Add a temporary home page and the dist checker**

`src/pages/index.astro` (replaced in Task 7):

```astro
---
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Get Pro Edge</title></head>
  <body><p>Get Pro Edge — under construction.</p></body>
</html>
```

`scripts/check-dist.mjs`:

```js
// Checks the built site in dist/:
//  1. every root-relative href/src points to a file that exists,
//  2. internal links have no trailing slash and no .html,
//  3. no banned text appears on any page.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const BANNED = [
  'Kemp Technology Group',
  'Boopify',
  'portal.getproedge.org',
  'progressiveedgellc.com',
  'Go Pro Edge',
  'H&R Block',
  'H&amp;R Block',
  'Block Advisors',
];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

function exists(url) {
  const path = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (path === '/') return existsSync(join(DIST, 'index.html'));
  const target = join(DIST, path);
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(`${target}.html`);
}

const problems = [];
const pages = existsSync(DIST) ? walk(DIST).filter((file) => file.endsWith('.html')) : [];
if (pages.length === 0) problems.push('dist/ has no HTML files; run npm run build first');

for (const file of pages) {
  const page = relative(DIST, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const path = url.split('#')[0].split('?')[0];
    if (!exists(url)) problems.push(`${page}: broken link ${url}`);
    if (path !== '/' && (path.endsWith('/') || path.endsWith('.html'))) {
      problems.push(`${page}: link ${url} must have no trailing slash and no .html`);
    }
  }
  for (const text of BANNED) {
    if (html.includes(text)) problems.push(`${page}: banned text "${text}"`);
  }
}

if (problems.length > 0) {
  console.error(`check-dist found ${problems.length} problem(s):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`check-dist: ${pages.length} page(s) OK`);
```

- [ ] **Step 8: Build, check and type-check**

Run: `npm run build && npm run check:dist && npm run check`
Expected: build `Complete!`; `check-dist: 1 page(s) OK`; `astro check` reports `0 errors`, `0 warnings`.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .nvmrc .gitignore astro.config.mjs tsconfig.json vitest.config.ts src/lib/paths.ts src/pages/index.astro scripts/check-dist.mjs tests/paths.test.ts
git commit -m "Scaffold Astro site with build checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared form rules

**Files:**
- Create: `functions/_lib/validate.ts`
- Test: `tests/functions/validate.test.ts`

**Interfaces:**
- Produces (all exported from `functions/_lib/validate.ts`):
  - Choice lists (`readonly` tuples): `CONTACT_SERVICES`, `CONTACT_METHODS`, `SUPPORT_CATEGORIES`, `PRIORITIES`, `USERS_AFFECTED`, `ALLOWED_EXTENSIONS`
  - Limits: `MAX_FILES = 5`, `MAX_FILE_BYTES = 10 MiB`, `MAX_TOTAL_BYTES = 20 MiB`, `MAX_BODY_BYTES = 25 MiB`
  - Field-name lists: `CONTACT_FIELDS: string[]`, `SUPPORT_FIELDS: string[]`
  - Types: `type Fields = Record<string, string>`, `interface FileMeta { name: string; size: number }`
  - `validateContact(fields: Fields): string[]` and `validateSupport(fields: Fields, files: FileMeta[]): string[]` — each returns the invalid field names in rule order; `'attachments'` is last for support. An empty array means valid.
  - `extensionOf(filename: string): string` returns the lowercase extension, or `''`.
  - `textFields(form: FormData, names: readonly string[]): Fields` returns trimmed values, with `''` for anything missing.
  - `attachedFiles(form: FormData, name?: string): File[]` returns the non-empty files under `name` (default `'attachments'`).

- [ ] **Step 1: Write the failing test**

`tests/functions/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  validateContact,
  validateSupport,
  textFields,
  attachedFiles,
  extensionOf,
  MAX_FILE_BYTES,
} from '../../functions/_lib/validate';

const contact = (overrides: Record<string, string> = {}) => ({
  name: 'Pat Doe',
  email: 'pat@example.com',
  company: '',
  phone: '',
  service: 'Not sure yet',
  message: 'Hello',
  ...overrides,
});

const support = (overrides: Record<string, string> = {}) => ({
  name: 'Pat Doe',
  company: 'Acme',
  email: 'pat@example.com',
  phone: '',
  preferred_contact_method: 'Email',
  category: 'Hardware',
  priority: 'Normal',
  subject: 'Printer jam',
  description: 'It jams on every page.',
  issue_started: '',
  users_affected: 'Just me',
  troubleshooting_attempted: '',
  best_contact_time: '',
  remote_support_permission: '',
  ...overrides,
});

const file = (name: string, size = 1000) => ({ name, size });

describe('validateContact', () => {
  it('accepts a complete submission', () => {
    expect(validateContact(contact())).toEqual([]);
  });
  it('requires name, email and message', () => {
    expect(validateContact(contact({ name: '', email: '  ', message: '' }))).toEqual(['name', 'email', 'message']);
  });
  it('rejects a malformed email', () => {
    expect(validateContact(contact({ email: 'pat@example' }))).toEqual(['email']);
  });
  it('enforces length limits', () => {
    expect(validateContact(contact({ name: 'a'.repeat(201) }))).toEqual(['name']);
    expect(validateContact(contact({ message: 'a'.repeat(5000) }))).toEqual([]);
    expect(validateContact(contact({ message: 'a'.repeat(5001) }))).toEqual(['message']);
    expect(validateContact(contact({ phone: '1'.repeat(51) }))).toEqual(['phone']);
  });
  it('allows an empty service but not an unknown one', () => {
    expect(validateContact(contact({ service: '' }))).toEqual([]);
    expect(validateContact(contact({ service: 'Plumbing' }))).toEqual(['service']);
  });
});

describe('validateSupport', () => {
  it('accepts a complete submission with no files', () => {
    expect(validateSupport(support(), [])).toEqual([]);
  });
  it('requires the required fields', () => {
    const empty = support({
      name: '', email: '', preferred_contact_method: '', category: '', priority: '',
      subject: '', description: '', users_affected: '',
    });
    expect(validateSupport(empty, [])).toEqual([
      'name', 'email', 'preferred_contact_method', 'category', 'priority', 'subject', 'description', 'users_affected',
    ]);
  });
  it('rejects values outside the fixed choices', () => {
    expect(validateSupport(support({ priority: 'Urgent' }), [])).toEqual(['priority']);
    expect(validateSupport(support({ category: 'Coffee machine' }), [])).toEqual(['category']);
  });
  it('only accepts "yes" for remote support permission', () => {
    expect(validateSupport(support({ remote_support_permission: 'yes' }), [])).toEqual([]);
    expect(validateSupport(support({ remote_support_permission: 'sure' }), [])).toEqual(['remote_support_permission']);
  });
  it('enforces the subject and description limits', () => {
    expect(validateSupport(support({ subject: 'a'.repeat(501) }), [])).toEqual(['subject']);
    expect(validateSupport(support({ description: 'a'.repeat(8001) }), [])).toEqual(['description']);
  });
  it('accepts up to five allowed files', () => {
    const files = ['a.png', 'b.JPG', 'c.pdf', 'd.docx', 'e.xlsx'].map((n) => file(n));
    expect(validateSupport(support(), files)).toEqual([]);
  });
  it('rejects a sixth file', () => {
    const files = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png', 'f.png'].map((n) => file(n));
    expect(validateSupport(support(), files)).toEqual(['attachments']);
  });
  it('rejects a disallowed extension', () => {
    expect(validateSupport(support(), [file('setup.exe')])).toEqual(['attachments']);
    expect(validateSupport(support(), [file('noextension')])).toEqual(['attachments']);
  });
  it('rejects a file over 10 MB', () => {
    expect(validateSupport(support(), [file('big.png', MAX_FILE_BYTES + 1)])).toEqual(['attachments']);
  });
  it('rejects more than 20 MB in total', () => {
    const eightMb = 8 * 1024 * 1024;
    expect(validateSupport(support(), [file('a.png', eightMb), file('b.png', eightMb), file('c.png', eightMb)])).toEqual(['attachments']);
  });
});

describe('form helpers', () => {
  it('reads and trims the named fields, ignoring others', () => {
    const form = new FormData();
    form.append('name', '  Pat  ');
    form.append('extra', 'ignored');
    expect(textFields(form, ['name', 'email'])).toEqual({ name: 'Pat', email: '' });
  });
  it('returns only non-empty attached files', () => {
    const form = new FormData();
    form.append('attachments', new File(['abc'], 'a.png'));
    form.append('attachments', new File([], ''));
    form.append('attachments', 'not a file');
    expect(attachedFiles(form).map((f) => f.name)).toEqual(['a.png']);
  });
  it('finds lowercase extensions', () => {
    expect(extensionOf('Report.PDF')).toBe('pdf');
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(extensionOf('README')).toBe('');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/functions/validate.test.ts`
Expected: FAIL — cannot resolve `../../functions/_lib/validate`.

- [ ] **Step 3: Implement**

`functions/_lib/validate.ts`:

```ts
// Form rules shared by the Pages Functions (server) and the form scripts (browser),
// so both sides apply exactly the same choices and limits.

export const CONTACT_SERVICES = [
  'Managed IT Support',
  'AI & Automation',
  'Technology Consulting',
  'Websites & Digital Products',
  'Not sure yet',
] as const;

export const CONTACT_METHODS = ['Email', 'Phone', 'Text'] as const;

export const SUPPORT_CATEGORIES = [
  'Computer / Laptop',
  'Microsoft 365 / Email',
  'Password / Account Access',
  'Printer / Scanner',
  'Network / Wi-Fi',
  'Software / Application',
  'Security Concern',
  'New Employee Setup',
  'Hardware',
  'Other',
] as const;

export const PRIORITIES = ['Critical', 'High', 'Normal', 'Low'] as const;

export const USERS_AFFECTED = ['Just me', 'A few people', 'An entire department', 'Everyone'] as const;

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx'] as const;
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const MAX_BODY_BYTES = 25 * 1024 * 1024;

export type Fields = Record<string, string>;
export interface FileMeta {
  name: string;
  size: number;
}

interface Rule {
  required?: boolean;
  max?: number;
  email?: boolean;
  oneOf?: readonly string[];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_RULES: Record<string, Rule> = {
  name: { required: true, max: 200 },
  email: { required: true, max: 254, email: true },
  company: { max: 200 },
  phone: { max: 50 },
  service: { oneOf: CONTACT_SERVICES },
  message: { required: true, max: 5000 },
};

const SUPPORT_RULES: Record<string, Rule> = {
  name: { required: true, max: 200 },
  company: { max: 200 },
  email: { required: true, max: 254, email: true },
  phone: { max: 50 },
  preferred_contact_method: { required: true, oneOf: CONTACT_METHODS },
  category: { required: true, oneOf: SUPPORT_CATEGORIES },
  priority: { required: true, oneOf: PRIORITIES },
  subject: { required: true, max: 500 },
  description: { required: true, max: 8000 },
  issue_started: { max: 200 },
  users_affected: { required: true, oneOf: USERS_AFFECTED },
  troubleshooting_attempted: { max: 8000 },
  best_contact_time: { max: 200 },
  remote_support_permission: { oneOf: ['yes'] },
};

export const CONTACT_FIELDS = Object.keys(CONTACT_RULES);
export const SUPPORT_FIELDS = Object.keys(SUPPORT_RULES);

function invalidFields(fields: Fields, rules: Record<string, Rule>): string[] {
  const invalid: string[] = [];
  for (const [name, rule] of Object.entries(rules)) {
    const value = (fields[name] ?? '').trim();
    if (value === '') {
      if (rule.required) invalid.push(name);
      continue;
    }
    const tooLong = rule.max !== undefined && value.length > rule.max;
    const badEmail = rule.email === true && !EMAIL.test(value);
    const badChoice = rule.oneOf !== undefined && !rule.oneOf.includes(value);
    if (tooLong || badEmail || badChoice) invalid.push(name);
  }
  return invalid;
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot < 0 ? '' : filename.slice(dot + 1).toLowerCase();
}

export function validateContact(fields: Fields): string[] {
  return invalidFields(fields, CONTACT_RULES);
}

export function validateSupport(fields: Fields, files: FileMeta[]): string[] {
  const invalid = invalidFields(fields, SUPPORT_RULES);
  const total = files.reduce((sum, f) => sum + f.size, 0);
  const allowed: readonly string[] = ALLOWED_EXTENSIONS;
  const filesOk =
    files.length <= MAX_FILES &&
    total <= MAX_TOTAL_BYTES &&
    files.every((f) => f.size <= MAX_FILE_BYTES && allowed.includes(extensionOf(f.name)));
  if (!filesOk) invalid.push('attachments');
  return invalid;
}

/** The named text fields from a submitted form, trimmed. Missing or file values become ''. */
export function textFields(form: FormData, names: readonly string[]): Fields {
  const fields: Fields = {};
  for (const name of names) {
    const value = form.get(name);
    fields[name] = typeof value === 'string' ? value.trim() : '';
  }
  return fields;
}

/** Files attached under `name`, skipping the empty placeholder a browser sends for an unused file input. */
export function attachedFiles(form: FormData, name = 'attachments'): File[] {
  return form.getAll(name).filter((value): value is File => typeof value !== 'string' && value.size > 0);
}
```

- [ ] **Step 4: Run it to make sure it passes**

Run: `npx vitest run tests/functions/validate.test.ts`
Expected: PASS (18 tests).

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/validate.ts tests/functions/validate.test.ts
git commit -m "Add shared form validation rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Turnstile verification

**Files:**
- Create: `functions/_lib/turnstile.ts`, `tests/helpers.ts`
- Test: `tests/functions/turnstile.test.ts`

**Interfaces:**
- Produces: `verifyTurnstile(token: string, secret: string, remoteIp: string | null, fetchImpl?: typeof fetch): Promise<boolean>`. It is true only when Cloudflare answers `success: true`. It never throws.
- Produces (test helper): `fakeFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>): { impl: typeof fetch; calls: { url: string; init: RequestInit }[] }`.

- [ ] **Step 1: Write the test helper and the failing test**

`tests/helpers.ts`:

```ts
export interface FetchCall {
  url: string;
  init: RequestInit;
}

/** A stand-in for fetch that records each call and answers with `respond`. */
export function fakeFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: FetchCall[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(input), init: init ?? {} };
    calls.push(call);
    return respond(call.url, call.init);
  }) as typeof fetch;
  return { impl, calls };
}
```

`tests/functions/turnstile.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { verifyTurnstile } from '../../functions/_lib/turnstile';
import { fakeFetch } from '../helpers';

describe('verifyTurnstile', () => {
  it('is false for an empty token without calling Cloudflare', async () => {
    const f = fakeFetch(() => Response.json({ success: true }));
    expect(await verifyTurnstile('', 'secret', '203.0.113.9', f.impl)).toBe(false);
    expect(f.calls).toHaveLength(0);
  });

  it('posts the secret, token and IP to siteverify and returns true on success', async () => {
    const f = fakeFetch(() => Response.json({ success: true }));
    expect(await verifyTurnstile('tok', 'secret', '203.0.113.9', f.impl)).toBe(true);
    expect(f.calls[0].url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(f.calls[0].init.method).toBe('POST');
    const body = f.calls[0].init.body as FormData;
    expect(body.get('secret')).toBe('secret');
    expect(body.get('response')).toBe('tok');
    expect(body.get('remoteip')).toBe('203.0.113.9');
  });

  it('omits remoteip when the IP is unknown', async () => {
    const f = fakeFetch(() => Response.json({ success: true }));
    await verifyTurnstile('tok', 'secret', null, f.impl);
    expect((f.calls[0].init.body as FormData).has('remoteip')).toBe(false);
  });

  it('is false when Cloudflare rejects the token', async () => {
    const f = fakeFetch(() => Response.json({ success: false, 'error-codes': ['invalid-input-response'] }));
    expect(await verifyTurnstile('tok', 'secret', null, f.impl)).toBe(false);
  });

  it('is false on a non-2xx answer', async () => {
    const f = fakeFetch(() => new Response('unavailable', { status: 503 }));
    expect(await verifyTurnstile('tok', 'secret', null, f.impl)).toBe(false);
  });

  it('is false when the request fails', async () => {
    const f = fakeFetch(() => {
      throw new Error('offline');
    });
    expect(await verifyTurnstile('tok', 'secret', null, f.impl)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/functions/turnstile.test.ts`
Expected: FAIL — cannot resolve `../../functions/_lib/turnstile`.

- [ ] **Step 3: Implement**

`functions/_lib/turnstile.ts`:

```ts
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Asks Cloudflare whether a Turnstile token is valid.
 * Any network error, timeout or unexpected answer counts as "not verified".
 */
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);
  try {
    const res = await fetchImpl(SITEVERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: unknown };
    return data.success === true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run it to make sure it passes**

Run: `npx vitest run tests/functions/turnstile.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/turnstile.ts tests/helpers.ts tests/functions/turnstile.test.ts
git commit -m "Add Turnstile token verification

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Forward to n8n

**Files:**
- Create: `functions/_lib/forward.ts`
- Test: `tests/functions/forward.test.ts`

**Interfaces:**
- Consumes: `fakeFetch` from `tests/helpers.ts` (Task 3).
- Produces:
  - `type ForwardResult = { ok: true; data: Record<string, unknown> } | { ok: false }`
  - `forwardToN8n(url: string, secret: string, body: FormData, fetchImpl?: typeof fetch, timeoutMs?: number): Promise<ForwardResult>`. The default timeout is 20 000 ms, and the function never throws.

- [ ] **Step 1: Write the failing test**

`tests/functions/forward.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { forwardToN8n } from '../../functions/_lib/forward';
import { fakeFetch } from '../helpers';

const URL_ = 'https://n8n.test/webhook/website-contact';

describe('forwardToN8n', () => {
  it('POSTs the form with the shared-secret header', async () => {
    const f = fakeFetch(() => Response.json({ ok: true }));
    const body = new FormData();
    body.append('name', 'Pat');
    await forwardToN8n(URL_, 'hook-secret', body, f.impl);
    expect(f.calls[0].url).toBe(URL_);
    expect(f.calls[0].init.method).toBe('POST');
    expect(new Headers(f.calls[0].init.headers).get('X-PE-Webhook-Secret')).toBe('hook-secret');
    expect(f.calls[0].init.body).toBe(body);
  });

  it('returns the JSON answer on success', async () => {
    const f = fakeFetch(() => Response.json({ ok: true, ticketNumber: '10042' }));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({
      ok: true,
      data: { ok: true, ticketNumber: '10042' },
    });
  });

  it('treats a non-JSON success as ok with no data', async () => {
    const f = fakeFetch(() => new Response('Workflow was started'));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: true, data: {} });
  });

  it('fails on a non-2xx answer', async () => {
    const f = fakeFetch(() => new Response('error', { status: 500 }));
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails when the request throws', async () => {
    const f = fakeFetch(() => {
      throw new Error('connection refused');
    });
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl)).toEqual({ ok: false });
  });

  it('fails when n8n does not answer before the timeout', async () => {
    const f = fakeFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    expect(await forwardToN8n(URL_, 's', new FormData(), f.impl, 20)).toEqual({ ok: false });
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/functions/forward.test.ts`
Expected: FAIL — cannot resolve `../../functions/_lib/forward`.

- [ ] **Step 3: Implement**

`functions/_lib/forward.ts`:

```ts
export type ForwardResult = { ok: true; data: Record<string, unknown> } | { ok: false };

/**
 * POSTs a form to an n8n webhook as multipart/form-data with the shared-secret header.
 * Never throws: a network error, timeout or non-2xx answer is { ok: false }.
 */
export async function forwardToN8n(
  url: string,
  secret: string,
  body: FormData,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 20_000,
): Promise<ForwardResult> {
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'X-PE-Webhook-Secret': secret },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false };
    const data: unknown = await res.json().catch(() => ({}));
    return { ok: true, data: data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : {} };
  } catch {
    return { ok: false };
  }
}
```

- [ ] **Step 4: Run it to make sure it passes**

Run: `npx vitest run tests/functions/forward.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/forward.ts tests/functions/forward.test.ts
git commit -m "Add n8n webhook forwarding

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Request pipeline and API endpoints

**Files:**
- Create: `functions/_lib/handle.ts`, `functions/api/contact.ts`, `functions/api/support.ts`
- Test: `tests/functions/handle.test.ts`

**Interfaces:**
- Consumes:
  - `verifyTurnstile` (Task 3) and `forwardToN8n` (Task 4).
  - From Task 2: `CONTACT_FIELDS`, `SUPPORT_FIELDS`, `MAX_BODY_BYTES`, `validateContact`, `validateSupport`, `textFields`, `attachedFiles`.
- Produces:
  - `interface Env { TURNSTILE_SECRET_KEY?: string; N8N_CONTACT_WEBHOOK_URL?: string; N8N_SUPPORT_WEBHOOK_URL?: string; N8N_WEBHOOK_SECRET?: string }`
  - `type FormKind = 'contact' | 'support'`
  - `handleSubmission(request: Request, env: Env, kind: FormKind, fetchImpl?: typeof fetch): Promise<Response>`
  - `onRequest(context: { request: Request; env: Env }): Promise<Response>`, exported from each `functions/api/*.ts`.
- Responses (browser contract, used by Tasks 11–12), all JSON:
  - `405` with `Allow: POST`.
  - `413 {error:"too_large"}`.
  - `200 {ok:true}` for the honeypot.
  - `500 {error:"config"}`.
  - `400 {error:"verification"}`.
  - `400 {error:"validation", fields:string[]}`.
  - `502 {error:"upstream"}`.
  - `200 {ok:true}` for contact, or `200 {ok:true, ticketNumber?:string}` for support.
- Fields sent to n8n (used by Task 15):
  - Every name in `CONTACT_FIELDS`/`SUPPORT_FIELDS`, trimmed.
  - `submitted_at` (ISO time).
  - Support files as `attachment_1`…`attachment_5`, with their original filenames.

- [ ] **Step 1: Write the failing test**

`tests/functions/handle.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { handleSubmission, type Env } from '../../functions/_lib/handle';
import { onRequest as contactEndpoint } from '../../functions/api/contact';
import { onRequest as supportEndpoint } from '../../functions/api/support';
import { fakeFetch } from '../helpers';

const ENV: Env = {
  TURNSTILE_SECRET_KEY: 'ts-secret',
  N8N_CONTACT_WEBHOOK_URL: 'https://n8n.test/webhook/website-contact',
  N8N_SUPPORT_WEBHOOK_URL: 'https://n8n.test/webhook/website-support',
  N8N_WEBHOOK_SECRET: 'hook-secret',
};

const CONTACT: Record<string, string> = {
  name: 'Pat Doe',
  email: 'pat@example.com',
  company: 'Acme',
  phone: '',
  service: 'Not sure yet',
  message: 'Hello there',
  'cf-turnstile-response': 'tok',
  website: '',
};

const SUPPORT: Record<string, string> = {
  name: 'Pat Doe',
  company: 'Acme',
  email: 'pat@example.com',
  phone: '989-555-0100',
  preferred_contact_method: 'Phone',
  category: 'Hardware',
  priority: 'Critical',
  subject: 'Server down',
  description: 'Nobody can sign in.',
  issue_started: 'This morning',
  users_affected: 'Everyone',
  troubleshooting_attempted: 'Restarted it',
  best_contact_time: 'Any time',
  remote_support_permission: 'yes',
  'cf-turnstile-response': 'tok',
  website: '',
};

function post(fields: Record<string, string>, files: File[] = [], headers: Record<string, string> = {}): Request {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.append(name, value);
  for (const file of files) body.append('attachments', file);
  return new Request('https://getproedge.org/api/test', {
    method: 'POST',
    body,
    headers: { 'CF-Connecting-IP': '203.0.113.9', ...headers },
  });
}

/** siteverify answers `turnstile`; every other URL is n8n and answers `n8n()`. */
function upstream(turnstile = true, n8n: () => Response = () => Response.json({ ok: true })) {
  return fakeFetch((url) => (url.includes('siteverify') ? Response.json({ success: turnstile }) : n8n()));
}

async function read(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe('handleSubmission', () => {
  it('rejects anything but POST', async () => {
    const res = await handleSubmission(new Request('https://getproedge.org/api/contact'), ENV, 'contact', upstream().impl);
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });

  it('rejects bodies over 25 MB', async () => {
    const req = post(CONTACT, [], { 'content-length': String(26 * 1024 * 1024) });
    expect(await read(await handleSubmission(req, ENV, 'contact', upstream().impl))).toEqual({
      status: 413,
      body: { error: 'too_large' },
    });
  });

  it('quietly accepts and drops a filled honeypot', async () => {
    const up = upstream();
    const res = await handleSubmission(post({ ...CONTACT, website: 'http://spam.example' }), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 200, body: { ok: true } });
    expect(up.calls).toHaveLength(0);
  });

  it('reports missing configuration', async () => {
    const res = await handleSubmission(post(CONTACT), { ...ENV, N8N_WEBHOOK_SECRET: '' }, 'contact', upstream().impl);
    expect(await read(res)).toEqual({ status: 500, body: { error: 'config' } });
  });

  it('rejects a failed Turnstile check without contacting n8n', async () => {
    const up = upstream(false);
    const res = await handleSubmission(post(CONTACT), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'verification' } });
    expect(up.calls).toHaveLength(1);
    expect((up.calls[0].init.body as FormData).get('remoteip')).toBe('203.0.113.9');
  });

  it('returns the invalid field names without contacting n8n', async () => {
    const up = upstream();
    const res = await handleSubmission(post({ ...CONTACT, email: 'not-an-email', message: '' }), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'validation', fields: ['email', 'message'] } });
    expect(up.calls).toHaveLength(1);
  });

  it('forwards a valid contact form to the contact webhook', async () => {
    const up = upstream();
    const res = await handleSubmission(post(CONTACT), ENV, 'contact', up.impl);
    expect(await read(res)).toEqual({ status: 200, body: { ok: true } });
    const n8n = up.calls[1];
    expect(n8n.url).toBe(ENV.N8N_CONTACT_WEBHOOK_URL);
    expect(new Headers(n8n.init.headers).get('X-PE-Webhook-Secret')).toBe('hook-secret');
    const sent = n8n.init.body as FormData;
    expect(sent.get('name')).toBe('Pat Doe');
    expect(sent.get('message')).toBe('Hello there');
    expect(sent.get('submitted_at')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(sent.has('cf-turnstile-response')).toBe(false);
    expect(sent.has('website')).toBe(false);
  });

  it('forwards support files as attachment_N and returns the ticket number', async () => {
    const up = upstream(true, () => Response.json({ ok: true, ticketNumber: 31001 }));
    const files = [
      new File(['png-bytes'], 'screen.png', { type: 'image/png' }),
      new File(['log'], 'error.txt', { type: 'text/plain' }),
    ];
    const res = await handleSubmission(post(SUPPORT, files), ENV, 'support', up.impl);
    expect(await read(res)).toEqual({ status: 200, body: { ok: true, ticketNumber: '31001' } });
    expect(up.calls[1].url).toBe(ENV.N8N_SUPPORT_WEBHOOK_URL);
    const sent = up.calls[1].init.body as FormData;
    expect((sent.get('attachment_1') as File).name).toBe('screen.png');
    expect((sent.get('attachment_2') as File).name).toBe('error.txt');
    expect(sent.get('priority')).toBe('Critical');
  });

  it('still succeeds when n8n returns no ticket number', async () => {
    const up = upstream(true, () => Response.json({ ok: true }));
    expect(await read(await handleSubmission(post(SUPPORT), ENV, 'support', up.impl))).toEqual({
      status: 200,
      body: { ok: true },
    });
  });

  it('rejects a disallowed attachment', async () => {
    const res = await handleSubmission(post(SUPPORT, [new File(['x'], 'run.exe')]), ENV, 'support', upstream().impl);
    expect(await read(res)).toEqual({ status: 400, body: { error: 'validation', fields: ['attachments'] } });
  });

  it('reports an upstream failure', async () => {
    const up = upstream(true, () => new Response('down', { status: 500 }));
    expect(await read(await handleSubmission(post(CONTACT), ENV, 'contact', up.impl))).toEqual({
      status: 502,
      body: { error: 'upstream' },
    });
  });
});

describe('endpoints', () => {
  it('wires /api/contact to the handler', async () => {
    const res = await contactEndpoint({ request: new Request('https://getproedge.org/api/contact'), env: ENV });
    expect(res.status).toBe(405);
  });
  it('wires /api/support to the handler', async () => {
    const res = await supportEndpoint({ request: new Request('https://getproedge.org/api/support'), env: ENV });
    expect(res.status).toBe(405);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/functions/handle.test.ts`
Expected: FAIL — cannot resolve `../../functions/_lib/handle`.

- [ ] **Step 3: Implement the pipeline**

`functions/_lib/handle.ts`:

```ts
import { forwardToN8n } from './forward';
import { verifyTurnstile } from './turnstile';
import {
  CONTACT_FIELDS,
  MAX_BODY_BYTES,
  SUPPORT_FIELDS,
  attachedFiles,
  textFields,
  validateContact,
  validateSupport,
} from './validate';

export interface Env {
  TURNSTILE_SECRET_KEY?: string;
  N8N_CONTACT_WEBHOOK_URL?: string;
  N8N_SUPPORT_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
}

export type FormKind = 'contact' | 'support';

const json = (status: number, body: unknown): Response =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * One form submission, start to finish. Never logs what the visitor typed or attached.
 * Order: method → size → honeypot → config → Turnstile → validation → n8n.
 */
export async function handleSubmission(
  request: Request,
  env: Env,
  kind: FormKind,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json(413, { error: 'too_large' });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'validation', fields: [] });
  }

  // Bots fill the hidden "website" field. Pretend it worked and drop it.
  const honeypot = form.get('website');
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return json(200, { ok: true });

  const webhookUrl = kind === 'contact' ? env.N8N_CONTACT_WEBHOOK_URL : env.N8N_SUPPORT_WEBHOOK_URL;
  if (!env.TURNSTILE_SECRET_KEY || !env.N8N_WEBHOOK_SECRET || !webhookUrl) {
    return json(500, { error: 'config' });
  }

  const token = form.get('cf-turnstile-response');
  const human = await verifyTurnstile(
    typeof token === 'string' ? token : '',
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP'),
    fetchImpl,
  );
  if (!human) return json(400, { error: 'verification' });

  const fields = textFields(form, kind === 'contact' ? CONTACT_FIELDS : SUPPORT_FIELDS);
  const files = kind === 'support' ? attachedFiles(form) : [];
  const invalid = kind === 'contact' ? validateContact(fields) : validateSupport(fields, files);
  if (invalid.length > 0) return json(400, { error: 'validation', fields: invalid });

  const outgoing = new FormData();
  for (const [name, value] of Object.entries(fields)) outgoing.append(name, value);
  outgoing.append('submitted_at', new Date().toISOString());
  files.forEach((file, index) => outgoing.append(`attachment_${index + 1}`, file, file.name));

  const result = await forwardToN8n(webhookUrl, env.N8N_WEBHOOK_SECRET, outgoing, fetchImpl);
  if (!result.ok) return json(502, { error: 'upstream' });
  if (kind === 'contact') return json(200, { ok: true });

  const ticketNumber = result.data.ticketNumber;
  return typeof ticketNumber === 'string' || typeof ticketNumber === 'number'
    ? json(200, { ok: true, ticketNumber: String(ticketNumber) })
    : json(200, { ok: true });
}
```

- [ ] **Step 4: Add the two Pages Function entry points**

`functions/api/contact.ts`:

```ts
import { handleSubmission, type Env } from '../_lib/handle';

// Cloudflare Pages Function for /api/contact. Every method reaches the handler, which answers 405 to non-POST.
export const onRequest = (context: { request: Request; env: Env }): Promise<Response> =>
  handleSubmission(context.request, context.env, 'contact');
```

`functions/api/support.ts`:

```ts
import { handleSubmission, type Env } from '../_lib/handle';

// Cloudflare Pages Function for /api/support. Every method reaches the handler, which answers 405 to non-POST.
export const onRequest = (context: { request: Request; env: Env }): Promise<Response> =>
  handleSubmission(context.request, context.env, 'support');
```

- [ ] **Step 5: Run it to make sure it passes**

Run: `npx vitest run tests/functions/handle.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 6: Run everything and type-check**

Run: `npm test && npm run check`
Expected: all test files pass; `astro check` reports `0 errors`.

- [ ] **Step 7: Commit**

```bash
git add functions/_lib/handle.ts functions/api/contact.ts functions/api/support.ts tests/functions/handle.test.ts
git commit -m "Add contact and support form endpoints

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Site config and content data

**Files:**
- Create: `src/config/site.ts`, `src/data/services.ts`, `src/data/team.ts`, `src/data/values.ts`
- Verify present: `src/assets/team/david.webp` (1254×1254) and `src/assets/team/stacey.webp` (1024×1536). These were already copied into place during planning. If either is missing, copy it from `C:\Users\David\AppData\Local\Temp\claude\f7e31ab8a04e102a\ce74a115-e396-4edc-81fc-a6b01e80b33b\images\` (`12.webp` is David, `13.webp` is Stacey). If those are gone too, stop and ask the owner for the headshots.
- Test: `tests/data.test.ts`

**Interfaces:**
- Consumes: `CONTACT_SERVICES` (Task 2).
- Produces:
  - `site` (an object; fields below) plus `bookingHref: string` and `bookingIsExternal: boolean` from `src/config/site.ts`.
  - `services: Service[]` and the types `Service`, `Step`, `Faq` from `src/data/services.ts`.
  - `team: Founder[]` and the type `Founder` from `src/data/team.ts`.
  - `values: Value[]` from `src/data/values.ts`.

- [ ] **Step 1: Confirm the headshots are in place**

Run: `ls -la src/assets/team/`
Expected: `david.webp` (117308 bytes) and `stacey.webp` (196890 bytes).

- [ ] **Step 2: Write the failing test**

`tests/data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { site, bookingHref, bookingIsExternal } from '../src/config/site';
import { services } from '../src/data/services';
import { team } from '../src/data/team';
import { values } from '../src/data/values';
import { CONTACT_SERVICES } from '../functions/_lib/validate';

const NEVER_IN_BIOS = [
  'Kemp Technology Group', 'Boopify', 'H&R Block', 'Block Advisors', 'Bob Jones', 'MidState',
  'AT&T', 'Berry Company', 'National City', 'Sinclair', '%',
];

describe('site config', () => {
  it('has the approved identity and contact details', () => {
    expect(site.name).toBe('Get Pro Edge');
    expect(site.endorsement).toBe('a Progressive Edge company');
    expect(site.legalName).toBe('Progressive Edge LLC');
    expect(site.phone).toEqual({ display: '(989) 200-4814', href: 'tel:+19892004814' });
    expect(site.email).toBe('info@getproedge.org');
    expect(site.replyPromise).toBe('We reply within one business day.');
    expect(site.tagline).toBe('ai / technology / people');
    expect(site.location).toEqual({ city: 'Auburn', region: 'MI', regionName: 'Michigan', country: 'US' });
  });
  it('sends Book a Call to /contact until a Bookings URL is set', () => {
    expect(bookingHref).toBe(site.bookingUrl || '/contact');
    expect(bookingIsExternal).toBe(site.bookingUrl !== '');
  });
});

describe('services', () => {
  it('lists the four services in order', () => {
    expect(services.map((s) => s.slug)).toEqual(['managed-it', 'ai-automation', 'consulting', 'websites']);
    expect(services.map((s) => s.number)).toEqual(['01', '02', '03', '04']);
  });
  it('gives every service complete content', () => {
    for (const s of services) {
      expect(s.included.length).toBeGreaterThanOrEqual(4);
      expect(s.whoFor.length).toBeGreaterThanOrEqual(1);
      expect(s.steps.map((step) => step.title)).toEqual(['Talk', 'Plan', 'Support']);
      expect(s.faqs.length).toBeGreaterThanOrEqual(3);
      expect(s.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });
  it('matches the contact form service choices', () => {
    expect([...services.map((s) => s.title), 'Not sure yet']).toEqual([...CONTACT_SERVICES]);
  });
});

describe('team', () => {
  it('lists both co-founders with their approved titles', () => {
    expect(team.map((f) => [f.name, f.title])).toEqual([
      ['David Kemp', 'Director of Technology Implementation'],
      ['Stacey Grant', 'Director of Operations'],
    ]);
  });
  it('uses the approved bios verbatim', () => {
    expect(team[0].bio).toContain(
      "David's prior experience with small organizations taught him how they really run and how technology impacts them.",
    );
    expect(team[1].bio.startsWith('Stacey brings more than twenty years of operations')).toBe(true);
  });
  it('never names past employers, schools or ownership details', () => {
    const text = team.flatMap((f) => [f.bio, f.summary]).join(' ');
    for (const word of NEVER_IN_BIOS) expect(text).not.toContain(word);
  });
});

describe('values', () => {
  it('has the four values in order', () => {
    expect(values.map((v) => v.title)).toEqual([
      'Honesty Over Comfort',
      'Outcomes Over Outputs',
      'Simplicity as a Feature',
      'Partnership, Not Vendor',
    ]);
  });
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL — cannot resolve `../src/config/site`.

- [ ] **Step 4: Write `src/config/site.ts`**

```ts
// The only place contact details and identity live. Pages and components import from here.
export const site = {
  name: 'Get Pro Edge',
  endorsement: 'a Progressive Edge company',
  legalName: 'Progressive Edge LLC',
  url: 'https://getproedge.org',
  tagline: 'ai / technology / people',
  description:
    'Managed IT, AI and automation, technology consulting, and websites — from one team you can actually reach.',
  phone: { display: '(989) 200-4814', href: 'tel:+19892004814' },
  email: 'info@getproedge.org',
  replyPromise: 'We reply within one business day.',
  location: { city: 'Auburn', region: 'MI', regionName: 'Michigan', country: 'US' },
  // Public Microsoft Bookings page URL. While empty, every Book a Call button goes to /contact.
  bookingUrl: '' as string,
  // Cloudflare Turnstile site key (public). This is Cloudflare's always-pass TEST key.
  // Replace it with the real key before launch (docs/setup.md, step 2).
  turnstileSiteKey: '1x00000000000000000000AA' as string,
} as const;

export const bookingHref: string = site.bookingUrl || '/contact';
export const bookingIsExternal: boolean = site.bookingUrl !== '';
```

- [ ] **Step 5: Write `src/data/services.ts`**

```ts
export interface Step {
  title: string;
  text: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  number: string;
  title: string;
  promise: string;
  summary: string;
  metaDescription: string;
  included: string[];
  whoFor: string[];
  steps: Step[];
  faqs: Faq[];
}

// Draft copy for owner review (spec §11). Claims stay general and true.
export const services: Service[] = [
  {
    slug: 'managed-it',
    number: '01',
    title: 'Managed IT Support',
    promise: 'Your IT, handled.',
    summary: 'Help desk, Microsoft 365, computers and networks — looked after by a team that knows your setup.',
    metaDescription:
      'Managed IT support from Get Pro Edge: help desk, remote support, Microsoft 365, devices, networks and security basics.',
    included: [
      'Help desk by phone, email and our support form',
      'Remote support',
      'Microsoft 365 administration — email, Teams, accounts and licenses',
      'Computers, printers, network and Wi-Fi',
      'New-employee setup and offboarding',
      'Security basics — updates and multi-factor sign-in',
    ],
    whoFor: ['Businesses without in-house IT', 'Teams whose IT person needs backup'],
    steps: [
      { title: 'Talk', text: 'Book a free call and tell us how your technology is set up today and what keeps going wrong.' },
      { title: 'Plan', text: 'We recommend a support plan that fits your team and give you a clear quote.' },
      { title: 'Support', text: 'We learn your systems, handle requests as they come in, and keep everything up to date.' },
    ],
    faqs: [
      {
        q: 'How do we ask for help?',
        a: 'Call us, email us, or use the support form on this site. Every request becomes a ticket, so nothing gets lost.',
      },
      {
        q: 'Can you work alongside our current IT person?',
        a: 'Yes. We can be their backup, take on specific areas, or handle the overflow.',
      },
      {
        q: 'Do you support Microsoft 365?',
        a: 'Yes. We manage accounts, licenses, email, Teams and security settings in Microsoft 365.',
      },
    ],
  },
  {
    slug: 'ai-automation',
    number: '02',
    title: 'AI & Automation',
    promise: 'Put AI to work on the busywork.',
    summary: 'AI phone agents, workflow automation and practical AI adoption that take busywork off your team.',
    metaDescription:
      'AI and automation from Get Pro Edge: AI receptionists, workflow automation, AI adoption and custom assistants.',
    included: [
      'AI receptionist and phone agents that answer, route and take messages',
      'Workflow automation between the apps you already use',
      'AI adoption — choosing tools, staff training and usage policies',
      'Custom assistants grounded in your business information',
    ],
    whoFor: [
      'Teams buried in repetitive admin or manual data entry',
      'Businesses that miss calls when everyone is busy',
    ],
    steps: [
      { title: 'Talk', text: "Book a free call and walk us through the tasks that eat your team's time." },
      { title: 'Plan', text: 'We show you what AI or automation can take on, what it will cost, and what stays with people.' },
      { title: 'Support', text: 'We build it, test it with your team, and keep it running and improving.' },
    ],
    faqs: [
      {
        q: 'Will AI replace my staff?',
        a: 'Our aim is to take repetitive work off your team so they can spend more time on customers and higher-value work. People stay in the loop.',
      },
      {
        q: 'Is our data safe?',
        a: 'We choose tools with business-grade privacy terms, connect only the information each system needs, and explain where your data goes before anything is built.',
      },
      {
        q: 'Do we need new software?',
        a: 'Usually not. We start with the apps you already use, such as Microsoft 365, and connect them.',
      },
    ],
  },
  {
    slug: 'consulting',
    number: '03',
    title: 'Technology Consulting',
    promise: 'Senior technology thinking, without a full-time hire.',
    summary: 'Assessments, roadmaps and straight answers for the big technology decisions in front of you.',
    metaDescription:
      'Technology consulting from Get Pro Edge: assessments, roadmaps, modernization, vendor selection and fractional leadership.',
    included: [
      'Technology assessment and roadmap',
      'Modernization — cloud and Microsoft 365 moves, retiring old systems',
      'Vendor and software selection',
      'Fractional technology leadership',
    ],
    whoFor: [
      'Growing organizations facing big technology decisions',
      'Owners who want a plain-English second opinion before they buy',
    ],
    steps: [
      { title: 'Talk', text: 'Book a free call and tell us about the decision or problem in front of you.' },
      { title: 'Plan', text: 'We review your current setup and give you a written recommendation with options and costs.' },
      { title: 'Support', text: 'We help you carry it out, or stay on as your part-time technology lead.' },
    ],
    faqs: [
      {
        q: 'What is fractional technology leadership?',
        a: 'Part-time, senior technology leadership — planning, budgeting, vendor management and decisions — without the cost of a full-time executive.',
      },
      {
        q: 'Will you just hand us a report?',
        a: 'No. Every recommendation comes with a clear plan, and we can stay to help you carry it out.',
      },
      {
        q: 'Can you work with our existing vendors?',
        a: 'Yes. We can manage vendors on your behalf or work alongside them.',
      },
    ],
  },
  {
    slug: 'websites',
    number: '04',
    title: 'Websites & Digital Products',
    promise: 'A web presence that brings in work.',
    summary: 'Websites, hosting, domains and online tools built to turn visitors into customers.',
    metaDescription:
      'Websites and digital products from Get Pro Edge: design and build, hosting, domains, business email and online tools.',
    included: [
      'Website design and build',
      'Hosting, domains and business email setup',
      'Ongoing updates',
      'Digital products such as online tools, portals and forms',
    ],
    whoFor: ['Businesses with an outdated website, or none', 'Teams that need an online form, tool or portal'],
    steps: [
      { title: 'Talk', text: 'Book a free call and tell us what your website needs to do for your business.' },
      { title: 'Plan', text: 'We propose the pages, features and timeline, with a clear quote.' },
      { title: 'Support', text: 'We build and launch it, then keep it updated and secure.' },
    ],
    faqs: [
      {
        q: 'Can you improve our existing website?',
        a: 'Often, yes. We review what you have and recommend whether to improve it or start fresh.',
      },
      {
        q: 'Can you set up business email?',
        a: 'Yes. We set up domains and business email, usually with Microsoft 365.',
      },
      {
        q: 'Do you build things other than websites?',
        a: 'Yes — online tools, customer portals and forms that connect to the systems you already use.',
      },
    ],
  },
];
```

- [ ] **Step 6: Write `src/data/team.ts`** (bios verbatim from spec §2)

```ts
import type { ImageMetadata } from 'astro';
import david from '../assets/team/david.webp';
import stacey from '../assets/team/stacey.webp';

export interface Founder {
  name: string;
  title: string;
  summary: string;
  bio: string;
  photo: ImageMetadata;
  photoAlt: string;
}

// Approved by the owners 2026-11-12. Use verbatim; never name past employers or schools.
export const team: Founder[] = [
  {
    name: 'David Kemp',
    title: 'Director of Technology Implementation',
    summary:
      'More than a decade in enterprise IT support, field operations and technology implementation, from on-site troubleshooting to AI-assisted solutions.',
    bio: "David has spent more than a decade keeping enterprise technology working where it matters most: in the field, in front of the people who depend on it. He grew from field systems technician to lead technician, building a reputation for finding the root cause instead of patching the symptom. He then moved into technology implementation, where he prototyped new tools, built workflow automations and AI-assisted solutions, and guided them from pilot to rollout. Most recently he has managed operations and systems projects. David's prior experience with small organizations taught him how they really run and how technology impacts them. At Get Pro Edge, David leads how solutions are designed, built and delivered, pairing hands-on technical depth with plain-English communication and genuine care for the customer.",
    photo: david,
    photoAlt: 'Portrait of David Kemp',
  },
  {
    name: 'Stacey Grant',
    title: 'Director of Operations',
    summary:
      'More than twenty years leading operations, projects and teams, including technology rollouts to more than 100 locations.',
    bio: 'Stacey brings more than twenty years of operations, project management and people leadership, including fifteen years in field operations for a national organization. She has run planning and readiness for three districts and more than 80 locations, kept relocation and construction projects on schedule, and taken new technology from pilot to adoption across more than 100 offices. Her projects have merged separate platforms into one dashboard that saved roughly $100,000 a year, and introduced an AI-powered analysis tool that cut a 60-minute review to five minutes. She has hired, coached and developed teams of up to 20 people, with engagement scores well above company benchmarks. Earlier roles in recruiting, HR consulting and executive support in banking and telecommunications grounded her in compliance, reporting and service. At Get Pro Edge, Stacey makes sure every project is scoped clearly, every client knows what happens next, and the work is delivered on time.',
    photo: stacey,
    photoAlt: 'Portrait of Stacey Grant',
  },
];
```

- [ ] **Step 7: Write `src/data/values.ts`** (copy carried from the earlier About draft)

```ts
export interface Value {
  title: string;
  text: string;
}

export const values: Value[] = [
  {
    title: 'Honesty Over Comfort',
    text: "We'll tell you what you need to hear, not what's easy to say. If your current approach isn't working, we say so — and we help you fix it.",
  },
  {
    title: 'Outcomes Over Outputs',
    text: 'A 200-page report that sits on a shelf is not a success. We measure our work by what changes in your organization, not what we delivered.',
  },
  {
    title: 'Simplicity as a Feature',
    text: "The most sophisticated solution is usually the simplest one that works. We resist complexity for its own sake — it's a liability, not a differentiator.",
  },
  {
    title: 'Partnership, Not Vendor',
    text: 'We operate as an extension of your team. Your goals are our goals — and we take that seriously from the first conversation to the last delivery.',
  },
];
```

- [ ] **Step 8: Run it to make sure it passes**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 9: Type-check**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 10: Commit**

```bash
git add src/config/site.ts src/data/services.ts src/data/team.ts src/data/values.ts src/assets/team/david.webp src/assets/team/stacey.webp tests/data.test.ts
git commit -m "Add site config, service, team and values content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Design system, layout and site chrome

**Files:**
- Create:
  - `src/styles/site.css` and `src/layouts/Base.astro`
  - Components: `src/components/Wordmark.astro`, `src/components/BookingLink.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`
  - Scripts: `src/scripts/nav.ts`, `src/scripts/reveal.ts`
  - `public/robots.txt` and `public/_redirects`
  - Icons, copied from `../Brand Guidelines/icons/`: `public/icons/favicon-16.png`, `public/icons/favicon-32.png`, `public/icons/apple-touch-icon-180.png`, `public/icons/app-icon-512.png`
- Modify: `src/pages/index.astro` (temporary page now uses `Base`; Task 8 replaces it)
- Test: build output assertions + `check:dist`

**Interfaces:**
- Consumes: `site`, `bookingHref`, `bookingIsExternal` (Task 6); `cleanPath`, `isCurrent` (Task 1).
- Produces:
  - `Base` layout. Props: `{ title: string; description: string; noindex?: boolean }`. It has a default slot (page content) and a named slot `head` (extra `<head>` tags).
  - `<BookingLink class?: string label?: string />`. The defaults are `class="btn btn-copper"` and `label="Book a Call"`. When the Bookings URL is set, it opens in a new tab and includes screen-reader text.
  - CSS classes used by later tasks:
    - Layout: `container`, `section`, `section-alt`, `section-label`, `section-title`, `lead`, `eyebrow`, `prose`
    - Buttons: `btn`, `btn-copper`, `btn-ice`, `btn-block`, `btn-row`, `btn-row--center`
    - Home: `hero`, `scroll-hint`, `scroll-track`, `page-header`, `note`
    - Cards and lists: `card-grid`, `service-card`, `service-num`, `service-title`, `service-link`, `check-list`, `two-col`, `steps`, `step`
    - Founders and values: `founder-grid`, `founder-card`, `founder-card--compact`, `photo-frame`, `founder-plate`, `founder-name`, `founder-role`, `founder-bio`, `founder-summary`, `more-link`, `values-grid`, `value`, `value-num`, `value-rule`
    - FAQ, contact and call to action: `faq`, `contact-layout`, `contact-grid`, `contact-card`, `booking-card`, `cta-band`
    - Form layout: `form-wrap`, `form-card`, `form-section`, `form-section-desc`, `field-row`, `field`, `label`, `req`, `select-wrap`, `help`, `field-error`, `has-error`, `choice-group`, `radio-row`, `radio`, `checkbox`
    - Priority and files: `priority-grid`, `priority-card`, `priority-card-inner`, `priority-card-title`, `priority-card-desc`, `file-drop`, `file-drop-label`, `file-drop-hint`, `file-list`, `file-item`, `file-item-name`, `file-item-size`, `file-remove`, `file-skipped`
    - Form states: `notice`, `form-banner`, `form-success`, `success-mark`, `ticket-badge`, `honeypot`, `turnstile`
    - Utility: `sr-only`
  - Attribute `data-reveal`, which fades an element in on scroll.

- [ ] **Step 1: Copy the icons**

```bash
mkdir -p public/icons
cp "../Brand Guidelines/icons/favicon-16.png" public/icons/favicon-16.png
cp "../Brand Guidelines/icons/favicon-32.png" public/icons/favicon-32.png
cp "../Brand Guidelines/icons/apple-touch-icon-180.png" public/icons/apple-touch-icon-180.png
cp "../Brand Guidelines/icons/app-icon-ink-512.png" public/icons/app-icon-512.png
ls public/icons
```

Expected: the four PNGs listed.

- [ ] **Step 2: Write `public/robots.txt` and `public/_redirects`**

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://getproedge.org/sitemap-index.xml
```

`public/_redirects`:

```
/support/request.html /support 301
/support/request /support 301
```

- [ ] **Step 3: Write `src/styles/site.css`**

```css
/* Get Pro Edge — the one stylesheet.
   Contrast rule: --silver text only on --ink / --ink-2. On --ink-3 use --silver-light. */

:root {
  --ink: #0F1420;
  --ink-2: #162035;
  --ink-3: #1D2B45;
  --slate: #334155;
  --silver: #848D9B;
  --silver-light: #C3CAD4;
  --ice: #2F8FA8;
  --ice-light: #9AE8F7;
  --paper: #F6F8FB;
  --copper: #C0623A;
  --copper-light: #F0A27A;
  --copper-button: #AD5634;
  --danger: #F08080;

  --border: rgba(195, 202, 212, 0.10);
  --border-ice: rgba(47, 143, 168, 0.35);
  --glow: 0 1px 24px rgba(47, 143, 168, 0.18);

  --f-logo: 'Michroma', monospace;
  --f-head: 'Jura', sans-serif;
  --f-body: 'Quantico', sans-serif;

  --gutter: 16px;
  color-scheme: dark;
}
@media (min-width: 560px) {
  :root { --gutter: 24px; }
}

/* ── Base ── */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
[hidden] { display: none !important; }
html { -webkit-text-size-adjust: 100%; scroll-padding-top: 96px; }
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--f-body);
  font-size: 1rem;
  line-height: 1.6;
  overflow-x: hidden;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(154, 232, 247, 0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(154, 232, 247, 0.022) 1px, transparent 1px);
  background-size: 56px 56px;
  pointer-events: none;
  z-index: 0;
}
main { flex: 1; position: relative; z-index: 1; }
main:focus { outline: none; }
img { display: block; max-width: 100%; height: auto; }
a { color: var(--ice-light); text-underline-offset: 3px; }
a:hover { color: var(--paper); }
:focus-visible { outline: 2px solid var(--ice-light); outline-offset: 3px; }
strong { color: var(--paper); }

.container {
  max-width: 1160px;
  margin-inline: auto;
  padding-inline: var(--gutter);
  position: relative;
  z-index: 1;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.skip-link {
  position: absolute;
  left: var(--gutter);
  top: -200px;
  z-index: 300;
  padding: 12px 18px;
  background: var(--paper);
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
}
.skip-link:focus { top: 12px; }

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 24px;
  font: 700 0.8rem/1.2 var(--f-body);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 0;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.btn-copper { background: var(--copper-button); color: var(--paper); }
.btn-copper:hover { background: var(--copper-light); color: var(--ink); }
.btn-ice { background: transparent; color: var(--ice-light); border-color: var(--ice); }
.btn-ice:hover { background: rgba(47, 143, 168, 0.12); color: var(--paper); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-block { width: 100%; padding-block: 14px; }
.btn-row { display: flex; flex-wrap: wrap; gap: 16px; }
.btn-row--center { justify-content: center; }

/* ── Wordmark ── */
.wordmark {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--f-logo);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  white-space: nowrap;
}
.wm-get { color: var(--paper); text-transform: uppercase; }
.wm-slash { color: var(--ice-light); margin-inline: 2px; }
.wm-edge { color: var(--silver-light); text-transform: lowercase; }

/* ── Navigation ── */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 20, 32, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--ice);
  box-shadow: var(--glow);
}
.nav-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding-block: 10px;
}
.nav-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 20px; }
.nav-links { display: flex; flex-wrap: wrap; gap: 0 20px; list-style: none; padding: 0; }
.nav-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--silver-light);
  text-decoration: none;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.nav-links a:hover,
.nav-links a[aria-current='page'] { color: var(--ice-light); }
.nav-toggle { display: none; }
.nav-toggle-bars,
.nav-toggle-bars::before,
.nav-toggle-bars::after {
  display: block;
  width: 18px;
  height: 2px;
  background: currentColor;
  transition: transform 0.2s, background 0.2s;
}
.nav-toggle-bars { position: relative; }
.nav-toggle-bars::before,
.nav-toggle-bars::after { content: ''; position: absolute; left: 0; }
.nav-toggle-bars::before { top: -6px; }
.nav-toggle-bars::after { top: 6px; }
.nav-toggle[aria-expanded='true'] .nav-toggle-bars { background: transparent; }
.nav-toggle[aria-expanded='true'] .nav-toggle-bars::before { top: 0; transform: rotate(45deg); }
.nav-toggle[aria-expanded='true'] .nav-toggle-bars::after { top: 0; transform: rotate(-45deg); }

/* Below 768px, once nav.ts has run, the links collapse behind the menu button.
   Without JavaScript the links simply wrap under the wordmark. */
@media (max-width: 767.98px) {
  .site-nav[data-enhanced] .nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: none;
    border: 1px solid var(--border-ice);
    color: var(--paper);
    cursor: pointer;
  }
  .site-nav[data-enhanced] .nav-panel { display: none; }
  .site-nav[data-enhanced] .nav-panel.is-open {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 8px;
    padding-block: 8px 16px;
    border-top: 1px solid var(--border);
  }
  .site-nav[data-enhanced] .nav-panel.is-open .nav-links { flex-direction: column; }
  .site-nav[data-enhanced] .nav-panel.is-open .nav-links a { width: 100%; font-size: 0.9rem; }
}
@media (min-width: 1024px) {
  .nav-links { gap: 0 32px; }
  .nav-panel { gap: 8px 32px; }
}

/* ── Sections ── */
.section { padding-block: 72px; border-top: 1px solid var(--border); }
.section-alt { background: var(--ink-2); }
@media (min-width: 768px) {
  .section { padding-block: 96px; }
}
.section-label {
  font: 700 0.68rem/1.4 var(--f-body);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ice-light);
  margin-bottom: 14px;
}
.section-title {
  font-family: var(--f-head);
  font-size: clamp(1.5rem, 3.2vw, 2.4rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-wrap: balance;
  max-width: 640px;
  margin-bottom: 40px;
}
.lead {
  color: var(--silver-light);
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  line-height: 1.75;
  max-width: 620px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: 700 0.7rem/1.4 var(--f-body);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ice-light);
  margin-bottom: 24px;
}
.eyebrow::before { content: ''; display: block; width: 28px; height: 1px; background: var(--ice-light); }
.more-link { margin-top: 32px; }
.more-link a { display: inline-flex; align-items: center; min-height: 44px; font-weight: 700; letter-spacing: 0.08em; }

.prose { max-width: 760px; }
.prose h2 { font-family: var(--f-head); font-size: 1.3rem; font-weight: 700; margin: 40px 0 12px; }
.prose h2:first-child { margin-top: 0; }
.prose p, .prose li { color: var(--silver-light); line-height: 1.8; }
.prose p + p { margin-top: 16px; }
.prose ul { padding-left: 1.2em; margin-top: 12px; }
.prose li + li { margin-top: 8px; }

/* ── Hero and page header ── */
.hero,
.page-header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--ice);
  box-shadow: 0 1px 32px rgba(47, 143, 168, 0.18);
}
.hero { padding-block: 64px 56px; }
.page-header { padding-block: 56px 48px; }
.hero::after,
.page-header::after {
  content: '';
  position: absolute;
  right: -80px;
  top: -60px;
  width: 560px;
  height: 480px;
  background: radial-gradient(ellipse, rgba(47, 143, 168, 0.16) 0%, transparent 60%);
  pointer-events: none;
}
.hero h1 {
  font-family: var(--f-head);
  font-size: clamp(2.2rem, 5.5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-wrap: balance;
  max-width: 780px;
  margin-bottom: 24px;
}
.page-header h1 {
  font-family: var(--f-head);
  font-size: clamp(1.9rem, 4.5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: 0.02em;
  text-wrap: balance;
  max-width: 760px;
  margin-bottom: 18px;
}
.hero h1 em,
.page-header h1 em { font-style: normal; color: var(--ice-light); }
.hero .lead { margin-bottom: 40px; }
.page-header .note { margin-top: 16px; color: var(--silver-light); font-size: 0.9rem; }
.page-header .btn-row { margin-top: 28px; }
.scroll-hint {
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--silver);
}
.scroll-track { width: 48px; height: 1px; background: var(--border); position: relative; overflow: hidden; }
.scroll-track::after {
  content: '';
  position: absolute;
  top: 0;
  left: -16px;
  width: 16px;
  height: 1px;
  background: var(--ice-light);
  animation: slide 2s ease-in-out infinite;
}
@keyframes slide {
  0% { left: -16px; }
  100% { left: 48px; }
}

/* ── Service cards ── */
.card-grid { display: grid; gap: 2px; background: var(--border); }
@media (min-width: 768px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
.service-card {
  display: flex;
  flex-direction: column;
  background: var(--ink-3);
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
  transition: background 0.25s, transform 0.25s;
}
@media (min-width: 768px) {
  .service-card { padding: 40px 36px; }
}
.service-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--copper);
  opacity: 0;
  transition: opacity 0.25s;
}
.service-card:hover { background: #1A2D4A; transform: translateY(-2px); }
.service-card:hover::after { opacity: 1; }
.service-num {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--f-logo);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--ice-light);
  margin-bottom: 20px;
}
.service-num::before { content: ''; display: block; width: 24px; height: 1px; background: var(--ice-light); opacity: 0.6; }
.service-title {
  font-family: var(--f-head);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
}
.service-title a { color: var(--paper); text-decoration: none; }
.service-title a:hover { color: var(--ice-light); }
.service-card p { font-size: 0.9rem; color: var(--silver-light); line-height: 1.7; }
.service-card .check-list { margin-top: 20px; }
.service-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin-top: auto;
  padding-top: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ice-light);
  text-decoration: none;
  transition: gap 0.2s;
}
.service-link::after { content: '\2192'; }
.service-card:hover .service-link { gap: 14px; }

/* ── Lists and two-column layout ── */
.check-list { list-style: none; padding: 0; display: grid; gap: 12px; }
.check-list li { position: relative; padding-left: 28px; color: var(--silver-light); line-height: 1.6; }
.check-list li::before {
  content: '/';
  position: absolute;
  left: 4px;
  top: 0;
  font-family: var(--f-logo);
  color: var(--ice-light);
}
.two-col { display: grid; gap: 56px; }
@media (min-width: 900px) {
  .two-col { grid-template-columns: 3fr 2fr; gap: 72px; }
}

/* ── Steps ── */
.steps { list-style: none; padding: 0; display: grid; gap: 2px; background: var(--border); counter-reset: step; }
@media (min-width: 768px) {
  .steps { grid-template-columns: repeat(3, 1fr); }
}
.step { background: var(--ink-2); padding: 32px 28px; counter-increment: step; }
.step::before {
  content: counter(step, decimal-leading-zero);
  display: block;
  margin-bottom: 16px;
  font-family: var(--f-logo);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--ice-light);
}
.step h3 { font-family: var(--f-head); font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.step p { color: var(--silver-light); font-size: 0.92rem; line-height: 1.7; }
.section-alt .step { background: var(--ink); }

/* ── Founders ── */
.founder-grid { display: grid; gap: 40px; }
@media (min-width: 768px) {
  .founder-grid { grid-template-columns: repeat(2, 1fr); gap: 48px; }
}
.founder-card { display: grid; gap: 20px; align-content: start; }
.founder-card--compact { grid-template-columns: 104px 1fr; gap: 20px; align-items: start; }
.photo-frame { position: relative; max-width: 360px; }
.photo-frame img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: 50% 22%;
  background: var(--ink-3);
  border: 1px solid var(--border);
}
.photo-frame::before,
.photo-frame::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 0 solid var(--ice);
  z-index: 2;
}
.photo-frame::before { top: -5px; left: -5px; border-width: 2px 0 0 2px; }
.photo-frame::after { bottom: -5px; right: -5px; border-width: 0 2px 2px 0; }
.founder-card--compact .photo-frame::before,
.founder-card--compact .photo-frame::after { width: 14px; height: 14px; }
.founder-plate { border-left: 3px solid var(--copper); padding-left: 16px; }
.founder-name { font-family: var(--f-head); font-size: 1.2rem; font-weight: 700; letter-spacing: 0.03em; }
.founder-role { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--silver); margin-top: 4px; }
.founder-summary { color: var(--silver-light); font-size: 0.9rem; line-height: 1.7; margin-top: 10px; }
.founder-bio { color: var(--silver-light); font-size: 0.95rem; line-height: 1.8; }

/* ── Values ── */
.values-grid { display: grid; gap: 40px; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); }
.value-num { font-family: var(--f-logo); font-size: 0.6rem; letter-spacing: 0.2em; color: var(--copper-light); }
.value-rule { width: 32px; height: 2px; background: var(--copper); margin: 12px 0 16px; }
.value h3 { font-family: var(--f-head); font-size: 1.05rem; font-weight: 700; letter-spacing: 0.03em; margin-bottom: 10px; }
.value p { color: var(--silver-light); font-size: 0.9rem; line-height: 1.7; }

/* ── FAQ ── */
.faq { display: grid; gap: 2px; background: var(--border); max-width: 860px; }
.faq details { background: var(--ink); }
.faq summary {
  position: relative;
  min-height: 44px;
  padding: 20px 56px 20px 24px;
  cursor: pointer;
  list-style: none;
  font-family: var(--f-head);
  font-size: 1.02rem;
  font-weight: 700;
}
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after {
  content: '+';
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--f-logo);
  color: var(--ice-light);
}
.faq details[open] summary::after { content: '\2212'; }
.faq details p { padding: 0 24px 22px; color: var(--silver-light); line-height: 1.75; }

/* ── Contact ── */
.contact-layout { display: grid; gap: 48px; }
@media (min-width: 1024px) {
  .contact-layout { grid-template-columns: 3fr 2fr; gap: 56px; align-items: start; }
}
.contact-side { display: grid; gap: 24px; }
.booking-card { background: var(--ink-3); border: 1px solid var(--border-ice); border-top: 3px solid var(--copper); padding: 28px; }
.booking-card h2 { font-family: var(--f-head); font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; }
.booking-card p { color: var(--silver-light); margin-bottom: 20px; }
.booking-card p:last-child { margin-bottom: 0; }
.contact-grid { display: grid; gap: 2px; background: var(--border); }
.contact-card { background: var(--ink-3); padding: 24px 28px; }
.contact-card h3 { margin-bottom: 6px; }
.contact-card a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--f-head);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--paper);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.contact-card a:hover { color: var(--ice-light); }
.contact-card p { color: var(--silver-light); font-size: 0.85rem; }

/* ── Call-to-action band ── */
.cta-band { position: relative; overflow: hidden; padding-block: 80px; text-align: center; border-top: 1px solid var(--border); }
@media (min-width: 768px) {
  .cta-band { padding-block: 96px; }
}
.cta-band::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(47, 143, 168, 0.07) 0%, transparent 65%);
  pointer-events: none;
}
.cta-band h2 {
  font-family: var(--f-head);
  font-size: clamp(1.6rem, 3.5vw, 2.8rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-wrap: balance;
  margin-bottom: 16px;
}
.cta-band p { color: var(--silver-light); max-width: 480px; margin: 0 auto 36px; }

/* ── Footer ── */
.site-footer { position: relative; z-index: 1; background: var(--ink); border-top: 1px solid var(--border); padding-block: 40px 28px; }
.footer-grid { display: grid; gap: 28px; }
@media (min-width: 768px) {
  .footer-grid { grid-template-columns: 2fr 1fr 1fr; align-items: start; }
}
.footer-endorse { margin-top: 2px; font-size: 0.8rem; color: var(--silver); letter-spacing: 0.06em; }
.footer-tagline { margin-top: 12px; font-size: 0.7rem; color: var(--silver); letter-spacing: 0.18em; text-transform: uppercase; }
.footer-links { list-style: none; padding: 0; }
.footer-links a,
.footer-contact a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--silver-light);
  text-decoration: none;
  font-size: 0.88rem;
}
.footer-links a:hover,
.footer-contact a:hover { color: var(--ice-light); }
.footer-contact { display: grid; justify-items: start; }
.footer-legal { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 0.72rem; color: var(--silver); letter-spacing: 0.1em; }

/* ── Forms ── */
.form-wrap { max-width: 760px; }
.form-card { background: var(--ink-3); border: 1px solid var(--border); padding: 24px 20px; }
@media (min-width: 600px) {
  .form-card { padding: 36px 40px; }
}
.form-section {
  position: relative;
  min-width: 0;
  margin: 0 0 32px;
  padding: 24px 20px;
  background: var(--ink-3);
  border: 1px solid var(--border);
}
@media (min-width: 600px) {
  .form-section { padding: 36px 40px; }
}
.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--ice);
  opacity: 0.6;
}
.form-section > legend {
  float: left;
  width: 100%;
  padding: 0;
  margin-bottom: 18px;
  font-family: var(--f-head);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.form-section > legend + * { clear: both; }
.form-section-desc { color: var(--silver-light); font-size: 0.88rem; margin-bottom: 20px; }
.field-row { display: grid; gap: 0 20px; }
@media (min-width: 560px) {
  .field-row { grid-template-columns: 1fr 1fr; }
}
.field { margin-bottom: 20px; min-width: 0; }
.field:last-child { margin-bottom: 0; }
.label,
.field > label {
  display: block;
  margin-bottom: 8px;
  padding: 0;
  font: 700 0.75rem/1.4 var(--f-body);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--silver-light);
}
.req { color: var(--ice-light); margin-left: 3px; }
.field input[type='text'],
.field input[type='email'],
.field input[type='tel'],
.field select,
.field textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  background: var(--ink-2);
  border: 1px solid var(--silver);
  border-radius: 0;
  color: var(--paper);
  font: 0.95rem/1.5 var(--f-body);
  appearance: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field input:focus,
.field select:focus,
.field textarea:focus { outline: none; border-color: var(--ice-light); box-shadow: 0 0 0 3px rgba(47, 143, 168, 0.35); }
.field input::placeholder,
.field textarea::placeholder { color: var(--silver); opacity: 1; }
.field textarea { resize: vertical; min-height: 120px; }
.select-wrap { position: relative; }
.select-wrap::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--silver-light);
  pointer-events: none;
}
.field select { padding-right: 40px; }
.field select option { background: var(--ink-2); }
.help { margin-top: 6px; color: var(--silver-light); font-size: 0.8rem; line-height: 1.5; }
.field-error { display: none; margin-top: 6px; color: var(--danger); font-size: 0.82rem; }
.has-error .field-error { display: block; }
.has-error input,
.has-error select,
.has-error textarea { border-color: var(--danger); }
.choice-group { border: 0; padding: 0; margin: 0 0 20px; min-width: 0; }
.radio-row { display: flex; flex-wrap: wrap; gap: 0 24px; }
.radio,
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: var(--silver-light);
  font-size: 0.92rem;
  cursor: pointer;
}
.checkbox { align-items: flex-start; padding-top: 10px; line-height: 1.6; }
.radio input,
.checkbox input { width: 18px; height: 18px; margin: 0; flex-shrink: 0; accent-color: var(--ice); }
.checkbox input { margin-top: 3px; }

.priority-grid { display: grid; gap: 12px; }
@media (min-width: 520px) {
  .priority-grid { grid-template-columns: repeat(2, 1fr); }
}
.priority-card { position: relative; cursor: pointer; }
.priority-card input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.priority-card-inner {
  display: block;
  height: 100%;
  padding: 16px 18px;
  background: var(--ink-2);
  border: 1px solid var(--silver);
  transition: border-color 0.2s, background 0.2s;
}
.priority-card input:focus-visible + .priority-card-inner { outline: 2px solid var(--ice-light); outline-offset: 3px; }
.priority-card-title { display: block; margin-bottom: 4px; font-family: var(--f-head); font-weight: 700; letter-spacing: 0.04em; }
.priority-card-desc { display: block; color: var(--silver-light); font-size: 0.8rem; line-height: 1.5; }
.priority-card[data-priority='Critical'] input:checked + .priority-card-inner { border-color: #E06060; background: rgba(224, 96, 96, 0.10); }
.priority-card[data-priority='High'] input:checked + .priority-card-inner { border-color: #E0A040; background: rgba(224, 160, 64, 0.10); }
.priority-card[data-priority='Normal'] input:checked + .priority-card-inner { border-color: var(--ice-light); background: rgba(47, 143, 168, 0.12); }
.priority-card[data-priority='Low'] input:checked + .priority-card-inner { border-color: var(--silver-light); background: rgba(132, 141, 155, 0.12); }

.file-drop {
  display: grid;
  gap: 6px;
  justify-items: center;
  padding: 28px 20px;
  background: var(--ink-2);
  border: 1px dashed var(--ice);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.file-drop:hover,
.file-drop.drag-over { border-color: var(--ice-light); background: rgba(47, 143, 168, 0.08); }
.file-drop-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ice-light); }
.file-drop-hint { font-size: 0.78rem; color: var(--silver); }
.file-list { list-style: none; padding: 0; margin-top: 12px; display: grid; gap: 8px; }
.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0 0 12px;
  background: var(--ink-2);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--silver-light);
}
.file-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-item-size { flex-shrink: 0; color: var(--silver); }
.file-remove {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: none;
  border: 0;
  color: var(--silver-light);
  font-size: 1rem;
  cursor: pointer;
}
.file-remove:hover { color: var(--danger); }
.file-skipped { margin-top: 10px; color: var(--copper-light); font-size: 0.82rem; }
.notice {
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(192, 98, 58, 0.08);
  border-left: 3px solid var(--copper);
  color: var(--silver-light);
  font-size: 0.8rem;
  line-height: 1.6;
}
.form-banner {
  margin-bottom: 24px;
  padding: 14px 18px;
  background: rgba(224, 96, 96, 0.10);
  border: 1px solid rgba(240, 128, 128, 0.4);
  border-left: 3px solid var(--danger);
  color: var(--silver-light);
  line-height: 1.6;
}
.form-banner strong { display: block; margin-bottom: 4px; font-family: var(--f-head); }
.form-success {
  padding: 40px 28px;
  background: var(--ink-3);
  border: 1px solid var(--border);
  border-top: 3px solid var(--ice);
  text-align: center;
}
.form-success:focus { outline: none; }
.form-success h2,
.form-success h3 { font-family: var(--f-head); font-size: 1.4rem; font-weight: 700; margin-bottom: 12px; }
.form-success p { color: var(--silver-light); max-width: 480px; margin: 0 auto 16px; }
.success-mark { font-size: 2.2rem; color: var(--ice-light); }
.ticket-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 4px 14px;
  background: rgba(47, 143, 168, 0.12);
  border: 1px solid var(--ice);
  font-family: var(--f-logo);
  color: var(--ice-light);
  letter-spacing: 0.12em;
}
.honeypot { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
.turnstile { min-height: 65px; margin-bottom: 20px; }

/* ── Motion ── */
.reveal-ready [data-reveal] { opacity: 0; transform: translateY(12px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal-ready [data-reveal].is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  .reveal-ready [data-reveal] { opacity: 1; transform: none; }
  .service-card:hover { transform: none; }
}
```

- [ ] **Step 4: Write the chrome components**

`src/components/Wordmark.astro`:

```astro
---
import { site } from '../config/site';
---
<a class="wordmark" href="/" aria-label={`${site.name} home`}>
  <span class="wm-get" aria-hidden="true">GET PRO</span><span class="wm-slash" aria-hidden="true">/</span><span class="wm-edge" aria-hidden="true">edge</span>
</a>
```

`src/components/BookingLink.astro`:

```astro
---
import { bookingHref, bookingIsExternal } from '../config/site';

interface Props {
  class?: string;
  label?: string;
}
const { class: className = 'btn btn-copper', label = 'Book a Call' } = Astro.props;
---
{bookingIsExternal ? (
  <a class={className} href={bookingHref} target="_blank" rel="noopener">{label}<span class="sr-only"> (opens in a new tab)</span></a>
) : (
  <a class={className} href={bookingHref}>{label}</a>
)}
```

`src/components/Nav.astro`:

```astro
---
import Wordmark from './Wordmark.astro';
import BookingLink from './BookingLink.astro';
import { isCurrent } from '../lib/paths';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/support', label: 'Support' },
];
const pathname = Astro.url.pathname;
---
<header class="site-nav" data-nav>
  <div class="container nav-inner">
    <Wordmark />
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" data-nav-toggle>
      <span class="sr-only">Menu</span>
      <span class="nav-toggle-bars" aria-hidden="true"></span>
    </button>
    <nav class="nav-panel" id="nav-panel" aria-label="Main" data-nav-panel>
      <ul class="nav-links">
        {links.map((link) => (
          <li><a href={link.href} aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}>{link.label}</a></li>
        ))}
      </ul>
      <BookingLink />
    </nav>
  </div>
</header>
<script>
  import '../scripts/nav';
</script>
```

`src/components/Footer.astro`:

```astro
---
import Wordmark from './Wordmark.astro';
import { site } from '../config/site';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/support', label: 'Support' },
  { href: '/privacy', label: 'Privacy' },
];
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <Wordmark />
      <p class="footer-endorse">{site.endorsement}</p>
      <p class="footer-tagline">{site.tagline}</p>
    </div>
    <nav aria-label="Footer">
      <ul class="footer-links">
        {links.map((link) => <li><a href={link.href}>{link.label}</a></li>)}
      </ul>
    </nav>
    <div class="footer-contact">
      <a href={site.phone.href}>{site.phone.display}</a>
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </div>
  </div>
  <div class="container">
    <p class="footer-legal">© {year} {site.legalName} · {site.location.city}, {site.location.regionName}</p>
  </div>
</footer>
```

- [ ] **Step 5: Write the two browser scripts**

`src/scripts/nav.ts`:

```ts
// Mobile menu (below 768px). Escape or a link click closes it; Escape returns focus to the button.
// Without this script the links stay visible and simply wrap.
const header = document.querySelector<HTMLElement>('[data-nav]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const panel = document.querySelector<HTMLElement>('[data-nav-panel]');

if (header && toggle && panel) {
  header.dataset.enhanced = '';

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  panel.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, true);
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
```

`src/scripts/reveal.ts`:

```ts
// Fades [data-reveal] elements in once as they scroll into view.
// Skipped entirely with reduced motion or without IntersectionObserver, so content is never hidden.
const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (items.length > 0 && !reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((item) => observer.observe(item));
}
```

- [ ] **Step 6: Write the layout**

`src/layouts/Base.astro`:

```astro
---
import '../styles/site.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { site } from '../config/site';
import { cleanPath } from '../lib/paths';

interface Props {
  title: string;
  description: string;
  noindex?: boolean;
}
const { title, description, noindex = false } = Astro.props;

const path = cleanPath(Astro.url.pathname);
const fullTitle = path === '/' ? `${site.name} — ${title}` : `${title} | ${site.name}`;
const canonical = new URL(path, site.url).href;
const ogImage = new URL('/og-image.png', site.url).href;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: new URL('/icons/app-icon-512.png', site.url).href,
  image: ogImage,
  telephone: site.phone.href.replace('tel:', ''),
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  },
};
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={canonical} />}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0F1420" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Michroma&family=Jura:wght@400;500;600;700&family=Quantico:wght@400;700&display=swap"
    />
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
    <slot name="head" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <Nav />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <Footer />
    <script>
      import '../scripts/reveal';
    </script>
  </body>
</html>
```

- [ ] **Step 7: Point the temporary home page at the layout**

Replace `src/pages/index.astro` with:

```astro
---
import Base from '../layouts/Base.astro';
import { site } from '../config/site';
---
<Base title="Technology That Works For People" description={site.description}>
  <section class="section"><div class="container"><p class="lead">Home page arrives in Task 8.</p></div></section>
</Base>
```

- [ ] **Step 8: Build and check the output**

Run:

```bash
npm run build && npm run check:dist
grep -o 'class="skip-link"' dist/index.html | wc -l
grep -o '<link rel="canonical" href="[^"]*"' dist/index.html
grep -o 'application/ld+json' dist/index.html | wc -l
grep -o '<title>[^<]*</title>' dist/index.html
```

(Astro writes each page on one line, so count matches with `grep -o … | wc -l`, never `grep -c`.)

Expected:
- The build completes.
- `check:dist` exits with errors. **That is expected until Task 13:** the nav and footer already link to pages that don't exist yet. Confirm the only problems listed are `broken link` entries for `/services`, `/about`, `/contact`, `/support` and `/privacy`.
- The greps print `1`, `<link rel="canonical" href="https://getproedge.org/"`, `1`, and `<title>Get Pro Edge — Technology That Works For People</title>`.

- [ ] **Step 9: Type-check**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 10: Commit**

```bash
git add src/styles/site.css src/layouts/Base.astro src/components/Wordmark.astro src/components/BookingLink.astro src/components/Nav.astro src/components/Footer.astro src/scripts/nav.ts src/scripts/reveal.ts src/pages/index.astro public/robots.txt public/_redirects public/icons
git commit -m "Add design system, base layout, nav and footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Shared sections and the Home page

**Files:**
- Create: `src/components/PageHeader.astro`, `SectionHeading.astro`, `ServiceCard.astro`, `Steps.astro`, `FounderCard.astro`, `Faq.astro`, `ContactMethods.astro`, `CtaBand.astro`
- Modify: `src/pages/index.astro` (final Home)
- Test: build output assertions

**Interfaces:**
- Consumes: `Base`, `BookingLink`, the CSS classes (Task 7); `site` (Task 6); `services`, `Service`, `Faq`, `Step`, `team`, `Founder` (Task 6).
- Produces component props:
  - `PageHeader {eyebrow: string; title: string; accent?: string; lead?: string}` plus a default slot.
  - `SectionHeading {label: string; title: string; id?: string}`.
  - `ServiceCard {service: Service; detailed?: boolean}`.
  - `Steps {steps: Step[]}`.
  - `FounderCard {founder: Founder; variant?: 'compact' | 'full'}`.
  - `Faq {faqs: Faq[]}`.
  - `ContactMethods` (no props).
  - `CtaBand {title?: string; text?: string}`.

- [ ] **Step 1: Write the section components**

`src/components/PageHeader.astro`:

```astro
---
interface Props {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
}
const { eyebrow, title, accent, lead } = Astro.props;
---
<header class="page-header">
  <div class="container">
    <p class="eyebrow">{eyebrow}</p>
    <h1>{title}{accent ? ' ' : ''}{accent && <em>{accent}</em>}</h1>
    {lead && <p class="lead">{lead}</p>}
    <slot />
  </div>
</header>
```

`src/components/SectionHeading.astro`:

```astro
---
interface Props {
  label: string;
  title: string;
  id?: string;
}
const { label, title, id } = Astro.props;
---
<p class="section-label">{label}</p>
<h2 class="section-title" id={id}>{title}</h2>
```

`src/components/ServiceCard.astro`:

```astro
---
import type { Service } from '../data/services';

interface Props {
  service: Service;
  detailed?: boolean;
}
const { service, detailed = false } = Astro.props;
const href = `/services/${service.slug}`;
---
<article class="service-card" data-reveal>
  <p class="service-num" aria-hidden="true">{service.number}</p>
  <h3 class="service-title"><a href={href}>{service.title}</a></h3>
  <p>{service.summary}</p>
  {detailed && (
    <ul class="check-list">
      {service.included.slice(0, 3).map((item) => <li>{item}</li>)}
    </ul>
  )}
  <a class="service-link" href={href} aria-label={`Learn more about ${service.title}`}>Learn more</a>
</article>
```

`src/components/Steps.astro`:

```astro
---
import type { Step } from '../data/services';

interface Props {
  steps: Step[];
}
const { steps } = Astro.props;
---
<ol class="steps">
  {steps.map((step) => (
    <li class="step" data-reveal>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
    </li>
  ))}
</ol>
```

`src/components/FounderCard.astro`:

```astro
---
import { Image } from 'astro:assets';
import type { Founder } from '../data/team';

interface Props {
  founder: Founder;
  variant?: 'compact' | 'full';
}
const { founder, variant = 'full' } = Astro.props;
---
{variant === 'compact' ? (
  <article class="founder-card founder-card--compact" data-reveal>
    <div class="photo-frame">
      <Image src={founder.photo} alt={founder.photoAlt} width={208} />
    </div>
    <div>
      <h3 class="founder-name">{founder.name}</h3>
      <p class="founder-role">Co-founder · {founder.title}</p>
      <p class="founder-summary">{founder.summary}</p>
    </div>
  </article>
) : (
  <article class="founder-card" data-reveal>
    <div class="photo-frame">
      <Image src={founder.photo} alt={founder.photoAlt} width={720} />
    </div>
    <div class="founder-plate">
      <h3 class="founder-name">{founder.name}</h3>
      <p class="founder-role">Co-founder · {founder.title}</p>
    </div>
    <p class="founder-bio">{founder.bio}</p>
  </article>
)}
```

`src/components/Faq.astro`:

```astro
---
import type { Faq } from '../data/services';

interface Props {
  faqs: Faq[];
}
const { faqs } = Astro.props;
---
<div class="faq">
  {faqs.map((faq) => (
    <details>
      <summary>{faq.q}</summary>
      <p>{faq.a}</p>
    </details>
  ))}
</div>
```

`src/components/ContactMethods.astro`:

```astro
---
import { site } from '../config/site';
---
<div class="contact-grid">
  <div class="contact-card">
    <h3 class="section-label">Call</h3>
    <a href={site.phone.href}>{site.phone.display}</a>
  </div>
  <div class="contact-card">
    <h3 class="section-label">Email</h3>
    <a href={`mailto:${site.email}`}>{site.email}</a>
    <p>{site.replyPromise}</p>
  </div>
</div>
```

`src/components/CtaBand.astro`:

```astro
---
import BookingLink from './BookingLink.astro';
import { site } from '../config/site';

interface Props {
  title?: string;
  text?: string;
}
const {
  title = 'Ready to find your edge?',
  text = "Tell us what's going on. We'll listen, ask good questions, and give you a straight answer.",
} = Astro.props;
---
<section class="cta-band" aria-labelledby="cta-title">
  <div class="container">
    <h2 id="cta-title">{title}</h2>
    <p>{text}</p>
    <div class="btn-row btn-row--center">
      <BookingLink label="Book a Free Consultation" />
      <a class="btn btn-ice" href={site.phone.href}>Call {site.phone.display}</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Write the Home page**

Replace `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import BookingLink from '../components/BookingLink.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ServiceCard from '../components/ServiceCard.astro';
import Steps from '../components/Steps.astro';
import FounderCard from '../components/FounderCard.astro';
import CtaBand from '../components/CtaBand.astro';
import { site } from '../config/site';
import { services } from '../data/services';
import { team } from '../data/team';

const howItWorks = [
  { title: 'Talk', text: "Book a free call and tell us what's going on." },
  { title: 'Plan', text: 'We come back with a clear recommendation and a quote.' },
  { title: 'Support', text: 'We put it in place and stay with you.' },
];
---
<Base title="Technology That Works For People" description={site.description}>
  <section class="hero" aria-labelledby="hero-title">
    <div class="container">
      <p class="eyebrow">{site.tagline}</p>
      <h1 id="hero-title">Technology That Works For <em>People.</em></h1>
      <p class="lead">{site.description}</p>
      <div class="btn-row">
        <BookingLink />
        <a class="btn btn-ice" href="/services">Our Services</a>
      </div>
      <div class="scroll-hint" aria-hidden="true"><span class="scroll-track"></span>Scroll to explore</div>
    </div>
  </section>

  <section class="section section-alt" aria-labelledby="services-title">
    <div class="container">
      <SectionHeading label="What We Do" title="Four services. One team you can reach." id="services-title" />
      <div class="card-grid">
        {services.map((service) => <ServiceCard service={service} />)}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="how-title">
    <div class="container">
      <SectionHeading label="How It Works" title="Simple from the first call." id="how-title" />
      <Steps steps={howItWorks} />
    </div>
  </section>

  <section class="section section-alt" aria-labelledby="founders-title">
    <div class="container">
      <SectionHeading label="Meet the Founders" title="The people you'll work with." id="founders-title" />
      <div class="founder-grid">
        {team.map((founder) => <FounderCard founder={founder} variant="compact" />)}
      </div>
      <p class="more-link"><a href="/about">More about us</a></p>
    </div>
  </section>

  <CtaBand />
</Base>
```

- [ ] **Step 3: Build and check the Home output**

Run:

```bash
npm run build
grep -o '<h1[^>]*>.*</h1>' dist/index.html
grep -o 'class="service-card"' dist/index.html | wc -l
grep -o 'founder-card founder-card--compact' dist/index.html | wc -l
grep -o 'href="/contact"' dist/index.html | wc -l
ls dist/_astro/*.webp
```

Expected:
- The H1 contains `Technology That Works For <em>People.</em>`.
- `4` service cards and `2` founder cards.
- At least `3` links to `/contact` (Book a Call falls back to it while `bookingUrl` is empty).
- Two resized `.webp` files.

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageHeader.astro src/components/SectionHeading.astro src/components/ServiceCard.astro src/components/Steps.astro src/components/FounderCard.astro src/components/Faq.astro src/components/ContactMethods.astro src/components/CtaBand.astro src/pages/index.astro
git commit -m "Add shared section components and the Home page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Services pages

**Files:**
- Create: `src/pages/services/index.astro`, `src/pages/services/[slug].astro`
- Test: build output assertions

**Interfaces:**
- Consumes: `Base`, `PageHeader`, `SectionHeading`, `ServiceCard`, `Steps`, `Faq`, `CtaBand` (Tasks 7–8); `services`, `Service` (Task 6).

- [ ] **Step 1: Write the overview page**

`src/pages/services/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import PageHeader from '../../components/PageHeader.astro';
import ServiceCard from '../../components/ServiceCard.astro';
import CtaBand from '../../components/CtaBand.astro';
import { services } from '../../data/services';
---
<Base
  title="Services"
  description="Managed IT support, AI and automation, technology consulting, and websites from Get Pro Edge."
>
  <PageHeader
    eyebrow="Services"
    title="Everything your technology needs, from"
    accent="one team."
    lead="Managed IT, AI and automation, technology consulting, and websites. Pick one, or let us handle it all."
  />
  <section class="section section-alt" aria-labelledby="all-services">
    <div class="container">
      <h2 class="sr-only" id="all-services">Our services</h2>
      <div class="card-grid">
        {services.map((service) => <ServiceCard service={service} detailed />)}
      </div>
    </div>
  </section>
  <CtaBand />
</Base>
```

- [ ] **Step 2: Write the service template**

`src/pages/services/[slug].astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import PageHeader from '../../components/PageHeader.astro';
import SectionHeading from '../../components/SectionHeading.astro';
import Steps from '../../components/Steps.astro';
import Faq from '../../components/Faq.astro';
import CtaBand from '../../components/CtaBand.astro';
import { services, type Service } from '../../data/services';

export function getStaticPaths() {
  return services.map((service) => ({ params: { slug: service.slug }, props: { service } }));
}

interface Props {
  service: Service;
}
const { service } = Astro.props;
---
<Base title={service.title} description={service.metaDescription}>
  <PageHeader eyebrow={`Service ${service.number}`} title={service.title} lead={service.promise} />

  <section class="section section-alt" aria-labelledby="included-title">
    <div class="container two-col">
      <div>
        <SectionHeading label="What's Included" title="What we take care of" id="included-title" />
        <ul class="check-list">
          {service.included.map((item) => <li data-reveal>{item}</li>)}
        </ul>
      </div>
      <div>
        <SectionHeading label="Who It's For" title="A good fit for" id="who-title" />
        <ul class="check-list">
          {service.whoFor.map((item) => <li data-reveal>{item}</li>)}
        </ul>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="engagement-title">
    <div class="container">
      <SectionHeading label="How It Works" title="How an engagement works" id="engagement-title" />
      <Steps steps={service.steps} />
    </div>
  </section>

  <section class="section section-alt" aria-labelledby="faq-title">
    <div class="container">
      <SectionHeading label="Questions" title="Common questions" id="faq-title" />
      <Faq faqs={service.faqs} />
    </div>
  </section>

  <CtaBand />
</Base>
```

- [ ] **Step 3: Build and check**

Run:

```bash
npm run build
ls dist/services.html dist/services/managed-it.html dist/services/ai-automation.html dist/services/consulting.html dist/services/websites.html
grep -o '<title>[^<]*</title>' dist/services/consulting.html
grep -o '<details>' dist/services/websites.html | wc -l
grep -o '<link rel="canonical" href="[^"]*"' dist/services/managed-it.html
```

Expected:
- All five files exist.
- The title is `Technology Consulting | Get Pro Edge`.
- `3` `<details>` elements on the websites page.
- The managed-it page's canonical URL is `https://getproedge.org/services/managed-it`.

- [ ] **Step 4: Type-check and commit**

Run: `npm run check` → `0 errors`.

```bash
git add src/pages/services/index.astro ':(literal)src/pages/services/[slug].astro'
git commit -m "Add services overview and service detail pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: About page

**Files:**
- Create: `src/pages/about.astro`
- Test: build output assertions

**Interfaces:**
- Consumes: `Base`, `PageHeader`, `SectionHeading`, `FounderCard`, `CtaBand` (Tasks 7–8); `site`, `team`, `values` (Task 6).

- [ ] **Step 1: Write the page**

`src/pages/about.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import PageHeader from '../components/PageHeader.astro';
import SectionHeading from '../components/SectionHeading.astro';
import FounderCard from '../components/FounderCard.astro';
import CtaBand from '../components/CtaBand.astro';
import { site } from '../config/site';
import { team } from '../data/team';
import { values } from '../data/values';

const companyLine = `${site.name} is ${site.endorsement}. ${site.legalName} is a Michigan limited liability company based in ${site.location.city}, ${site.location.regionName}.`;
---
<Base
  title="About"
  description={`${site.name} is ${site.endorsement}, founded by David Kemp and Stacey Grant in ${site.location.city}, ${site.location.regionName}.`}
>
  <PageHeader
    eyebrow="About"
    title="Senior-level technology help from people you"
    accent="know by name."
    lead="Progressive Edge was started by David Kemp and Stacey Grant to give businesses of every size dependable, senior-level technology help from people they know by name."
  />

  <section class="section section-alt" aria-labelledby="founders-title">
    <div class="container">
      <SectionHeading label="The Founders" title="Meet David and Stacey." id="founders-title" />
      <div class="founder-grid">
        {team.map((founder) => <FounderCard founder={founder} />)}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="values-title">
    <div class="container">
      <SectionHeading label="What We Stand For" title="The principles that guide every engagement." id="values-title" />
      <div class="values-grid">
        {values.map((value, index) => (
          <div class="value" data-reveal>
            <p class="value-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
            <div class="value-rule" aria-hidden="true"></div>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section class="section section-alt" aria-labelledby="company-title">
    <div class="container">
      <SectionHeading label="The Company" title="Who we are, officially." id="company-title" />
      <p class="lead">{companyLine}</p>
    </div>
  </section>

  <CtaBand />
</Base>
```

- [ ] **Step 2: Build and check**

Run:

```bash
npm run build
grep -o 'class="founder-bio"' dist/about.html | wc -l
grep -o "prior experience with small organizations taught him" dist/about.html | wc -l
grep -o 'Progressive Edge LLC is a Michigan limited liability company based in[^<]*' dist/about.html
```

(Astro writes each page on one line, so count matches with `grep -o … | wc -l`, never `grep -c`.)

Expected:
- `2` bios.
- `1` match for David's approved sentence (Astro may escape the apostrophe).
- The company line ends `Auburn, Michigan.`

- [ ] **Step 3: Type-check and commit**

Run: `npm run check` → `0 errors`.

```bash
git add src/pages/about.astro
git commit -m "Add About page with co-founder profiles and values

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Contact page and form script

**Files:**
- Create: `src/scripts/forms.ts`, `src/scripts/contact-form.ts`, `src/pages/contact.astro`
- Test: `astro check` (types), build output assertions. In-browser behaviour is verified on the preview deploy in Task 17.

**Interfaces:**
- Consumes:
  - `CONTACT_FIELDS`, `CONTACT_SERVICES`, `validateContact`, `textFields` (Task 2).
  - The `/api/contact` response contract (Task 5).
  - `site`, `bookingIsExternal` (Task 6).
  - `Base`, `PageHeader`, `BookingLink`, `ContactMethods` (Tasks 7–8).
- Produces (from `src/scripts/forms.ts`, also used by Task 12):
  - `postForm(endpoint: string, body: FormData): Promise<{ ok: boolean; data: Record<string, unknown> }>`.
  - `showFieldErrors(form: HTMLFormElement, invalid: readonly string[]): HTMLElement | null`. It toggles `.has-error` and `aria-invalid` on each `[data-field]` group, and returns the first control to focus.
  - `resetTurnstile(form: HTMLFormElement): void`.
- Markup contract for both forms:
  - Each field group carries `data-field="<field name>"` and contains a `.field-error` with id `err-<field name>`.
  - The error banner is `[data-form-error]`, and the success panel is `[data-form-success]`.

- [ ] **Step 1: Write the shared browser helpers**

`src/scripts/forms.ts`:

```ts
export interface SubmitResult {
  ok: boolean;
  data: Record<string, unknown>;
}

/** POSTs a form to one of our /api endpoints. Never throws. */
export async function postForm(endpoint: string, body: FormData): Promise<SubmitResult> {
  try {
    const res = await fetch(endpoint, { method: 'POST', body });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok && data.ok === true, data };
  } catch {
    return { ok: false, data: {} };
  }
}

const FOCUSABLE = '[data-focus], input:not([type="hidden"]):not([hidden]), select, textarea';

/** Marks the listed fields invalid and clears all others. Returns the first invalid control, or null. */
export function showFieldErrors(form: HTMLFormElement, invalid: readonly string[]): HTMLElement | null {
  let first: HTMLElement | null = null;
  for (const group of Array.from(form.querySelectorAll<HTMLElement>('[data-field]'))) {
    const bad = invalid.includes(group.dataset.field ?? '');
    group.classList.toggle('has-error', bad);
    for (const control of Array.from(group.querySelectorAll('input, select, textarea'))) {
      if (bad) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
    if (bad && first === null) first = group.querySelector<HTMLElement>(FOCUSABLE);
  }
  return first;
}

interface TurnstileApi {
  reset(widget?: string | HTMLElement): void;
}

/** Turnstile tokens are single-use: get a fresh one after a failed submit. */
export function resetTurnstile(form: HTMLFormElement): void {
  const widget = form.querySelector<HTMLElement>('.cf-turnstile');
  const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
  if (widget && api) api.reset(widget);
}
```

- [ ] **Step 2: Write the contact form script**

`src/scripts/contact-form.ts`:

```ts
import { CONTACT_FIELDS, textFields, validateContact } from '../../functions/_lib/validate';
import { postForm, resetTurnstile, showFieldErrors } from './forms';

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const banner = document.querySelector<HTMLElement>('[data-form-error]');
const success = document.querySelector<HTMLElement>('[data-form-success]');

if (form && banner && success) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  let sending = false;

  const setSending = (on: boolean) => {
    sending = on;
    if (button) {
      button.disabled = on;
      button.textContent = on ? 'Sending…' : 'Send Message';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const data = new FormData(form);
    const firstInvalid = showFieldErrors(form, validateContact(textFields(data, CONTACT_FIELDS)));
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setSending(true);
    banner.hidden = true;
    const result = await postForm('/api/contact', data);
    if (result.ok) {
      form.hidden = true;
      success.hidden = false;
      success.focus();
      return;
    }

    const fields = result.data.fields;
    if (result.data.error === 'validation' && Array.isArray(fields)) {
      showFieldErrors(form, fields as string[])?.focus();
    }
    banner.hidden = false;
    resetTurnstile(form);
    setSending(false);
  });
}
```

- [ ] **Step 3: Write the page**

`src/pages/contact.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import PageHeader from '../components/PageHeader.astro';
import BookingLink from '../components/BookingLink.astro';
import ContactMethods from '../components/ContactMethods.astro';
import { site, bookingIsExternal } from '../config/site';
import { CONTACT_SERVICES } from '../../functions/_lib/validate';
---
<Base title="Contact" description={`Book a call, send a message, or call ${site.phone.display}. ${site.replyPromise}`}>
  <Fragment slot="head">
    <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  </Fragment>

  <PageHeader
    eyebrow="Contact"
    title="Let's talk about what you"
    accent="need."
    lead={`${site.replyPromise} Book a call, send a message, or reach us directly.`}
  />

  <section class="section section-alt">
    <div class="container contact-layout">
      <div>
        <h2 class="section-title" id="message-title">Send a message</h2>
        <div class="form-banner" role="alert" data-form-error hidden>
          <strong>We couldn't send your message.</strong>
          Please check the form and try again, or call <a href={site.phone.href}>{site.phone.display}</a> or email
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </div>

        <form class="form-card" data-contact-form novalidate aria-labelledby="message-title">
          <div class="field-row">
            <div class="field" data-field="name">
              <label for="name">Name<span class="req" aria-hidden="true">*</span></label>
              <input id="name" name="name" type="text" required maxlength="200" autocomplete="name" aria-describedby="err-name" />
              <p class="field-error" id="err-name">Please enter your name.</p>
            </div>
            <div class="field" data-field="email">
              <label for="email">Email<span class="req" aria-hidden="true">*</span></label>
              <input id="email" name="email" type="email" required maxlength="254" autocomplete="email" aria-describedby="err-email" />
              <p class="field-error" id="err-email">Please enter a valid email address.</p>
            </div>
          </div>
          <div class="field-row">
            <div class="field" data-field="company">
              <label for="company">Company</label>
              <input id="company" name="company" type="text" maxlength="200" autocomplete="organization" aria-describedby="err-company" />
              <p class="field-error" id="err-company">Please keep this under 200 characters.</p>
            </div>
            <div class="field" data-field="phone">
              <label for="phone">Phone</label>
              <input id="phone" name="phone" type="tel" maxlength="50" autocomplete="tel" aria-describedby="err-phone" />
              <p class="field-error" id="err-phone">Please keep this under 50 characters.</p>
            </div>
          </div>
          <div class="field" data-field="service">
            <label for="service">What can we help with?</label>
            <div class="select-wrap">
              <select id="service" name="service" aria-describedby="err-service">
                {CONTACT_SERVICES.map((option) => (
                  <option value={option} selected={option === 'Not sure yet'}>{option}</option>
                ))}
              </select>
            </div>
            <p class="field-error" id="err-service">Please choose one of the options.</p>
          </div>
          <div class="field" data-field="message">
            <label for="message">Message<span class="req" aria-hidden="true">*</span></label>
            <textarea id="message" name="message" rows="6" required maxlength="5000" aria-describedby="err-message"></textarea>
            <p class="field-error" id="err-message">Please tell us a little about what you need.</p>
          </div>
          <div class="honeypot" aria-hidden="true">
            <label for="website">Leave this field empty</label>
            <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <div class="cf-turnstile turnstile" data-sitekey={site.turnstileSiteKey} data-theme="dark"></div>
          <button class="btn btn-copper btn-block" type="submit">Send Message</button>
        </form>

        <div class="form-success" data-form-success tabindex="-1" hidden>
          <h3>Thanks, your message is on its way.</h3>
          <p>{site.replyPromise}</p>
        </div>
      </div>

      <aside class="contact-side" aria-labelledby="book-title">
        <div class="booking-card">
          <h2 id="book-title">Book a call</h2>
          {bookingIsExternal ? (
            <>
              <p>Pick a time that works for you, and we'll call you then.</p>
              <BookingLink label="Choose a Time" />
            </>
          ) : (
            <p>Online booking is coming soon. Call or send a message and we'll set up a time.</p>
          )}
        </div>
        <ContactMethods />
      </aside>
    </div>
  </section>

  <script>
    import '../scripts/contact-form';
  </script>
</Base>
```

- [ ] **Step 4: Build and check**

Run:

```bash
npm run build
grep -o 'challenges.cloudflare.com/turnstile/v0/api.js' dist/contact.html | wc -l
grep -o '<option[^>]*>[^<]*</option>' dist/contact.html | wc -l
grep -o 'name="website"' dist/contact.html | wc -l
grep -o 'data-sitekey="[^"]*"' dist/contact.html
```

Expected: `1`, `5`, `1`, `data-sitekey="1x00000000000000000000AA"`.

- [ ] **Step 5: Type-check and commit**

Run: `npm run check` → `0 errors`.

```bash
git add src/scripts/forms.ts src/scripts/contact-form.ts src/pages/contact.astro
git commit -m "Add Contact page with message form

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Support page and form script

**Files:**
- Create: `src/scripts/support-form.ts`, `src/pages/support.astro`
- Test: `astro check`, build output assertions. In-browser behaviour is verified in Task 17.

**Interfaces:**
- Consumes:
  - From Task 2: `SUPPORT_FIELDS`, `SUPPORT_CATEGORIES`, `PRIORITIES`, `CONTACT_METHODS`, `USERS_AFFECTED`, `ALLOWED_EXTENSIONS`, `MAX_FILES`, `MAX_FILE_BYTES`, `MAX_TOTAL_BYTES`, `extensionOf`, `validateSupport`, `textFields`.
  - `postForm`, `showFieldErrors`, `resetTurnstile` (Task 11).
  - The `/api/support` contract (Task 5).
- Ported from the old `support/request.html`: field names, the category list, the priority wording and the file rules. Changes from the old form:
  - Total attachments are capped at 20 MB.
  - Rejected files are listed instead of silently skipped.
  - There's no claim that a confirmation email was sent.
  - The brand is now Get Pro Edge.

- [ ] **Step 1: Write the support form script**

`src/scripts/support-form.ts`:

```ts
import {
  ALLOWED_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  SUPPORT_FIELDS,
  extensionOf,
  textFields,
  validateSupport,
} from '../../functions/_lib/validate';
import { postForm, resetTurnstile, showFieldErrors } from './forms';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const form = document.querySelector<HTMLFormElement>('[data-support-form]');
const banner = document.querySelector<HTMLElement>('[data-form-error]');
const success = document.querySelector<HTMLElement>('[data-form-success]');
const ticketLine = document.querySelector<HTMLElement>('[data-ticket-line]');
const ticketNumber = document.querySelector<HTMLElement>('[data-ticket-number]');
const another = document.querySelector<HTMLButtonElement>('[data-submit-another]');
const drop = document.querySelector<HTMLElement>('[data-file-drop]');
const input = document.querySelector<HTMLInputElement>('[data-file-input]');
const list = document.querySelector<HTMLUListElement>('[data-file-list]');
const skipped = document.querySelector<HTMLElement>('[data-file-skipped]');

if (form && banner && success && ticketLine && ticketNumber && another && drop && input && list && skipped) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const allowed: readonly string[] = ALLOWED_EXTENSIONS;
  let files: File[] = [];
  let sending = false;

  const setSending = (on: boolean) => {
    sending = on;
    if (button) {
      button.disabled = on;
      button.textContent = on ? 'Submitting…' : 'Submit Support Request';
    }
  };

  const render = () => {
    list.replaceChildren(
      ...files.map((file, index) => {
        const item = document.createElement('li');
        item.className = 'file-item';
        const name = document.createElement('span');
        name.className = 'file-item-name';
        name.textContent = file.name;
        const size = document.createElement('span');
        size.className = 'file-item-size';
        size.textContent = formatBytes(file.size);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'file-remove';
        remove.setAttribute('aria-label', `Remove ${file.name}`);
        remove.textContent = '✕';
        remove.addEventListener('click', () => {
          files.splice(index, 1);
          render();
          drop.focus();
        });
        item.append(name, size, remove);
        return item;
      }),
    );
  };

  const addFiles = (incoming: File[]) => {
    const rejected: string[] = [];
    for (const file of incoming) {
      const total = files.reduce((sum, f) => sum + f.size, 0) + file.size;
      const ok =
        files.length < MAX_FILES &&
        allowed.includes(extensionOf(file.name)) &&
        file.size <= MAX_FILE_BYTES &&
        total <= MAX_TOTAL_BYTES;
      if (ok) files.push(file);
      else rejected.push(file.name);
    }
    skipped.hidden = rejected.length === 0;
    skipped.textContent =
      rejected.length === 0 ? '' : `Not added (too large, too many, or an unsupported type): ${rejected.join(', ')}`;
    render();
  };

  input.addEventListener('change', () => {
    addFiles(Array.from(input.files ?? []));
    input.value = '';
  });
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });
  drop.addEventListener('dragover', (event) => {
    event.preventDefault();
    drop.classList.add('drag-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', (event) => {
    event.preventDefault();
    drop.classList.remove('drag-over');
    addFiles(Array.from(event.dataTransfer?.files ?? []));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const data = new FormData(form);
    data.delete('attachments');
    for (const file of files) data.append('attachments', file);

    const firstInvalid = showFieldErrors(form, validateSupport(textFields(data, SUPPORT_FIELDS), files));
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setSending(true);
    banner.hidden = true;
    const result = await postForm('/api/support', data);
    if (result.ok) {
      const number = result.data.ticketNumber;
      ticketNumber.textContent = typeof number === 'string' ? number : '';
      ticketLine.hidden = typeof number !== 'string';
      form.hidden = true;
      success.hidden = false;
      success.focus();
      setSending(false);
      return;
    }

    const fields = result.data.fields;
    if (result.data.error === 'validation' && Array.isArray(fields)) {
      showFieldErrors(form, fields as string[]);
    }
    banner.hidden = false;
    banner.scrollIntoView({ block: 'nearest' });
    resetTurnstile(form);
    setSending(false);
  });

  another.addEventListener('click', () => {
    form.reset();
    files = [];
    render();
    skipped.hidden = true;
    showFieldErrors(form, []);
    resetTurnstile(form);
    success.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLInputElement>('#name')?.focus();
  });
}
```

- [ ] **Step 2: Write the page**

`src/pages/support.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import PageHeader from '../components/PageHeader.astro';
import { site } from '../config/site';
import {
  ALLOWED_EXTENSIONS,
  CONTACT_METHODS,
  MAX_FILES,
  PRIORITIES,
  SUPPORT_CATEGORIES,
  USERS_AFFECTED,
} from '../../functions/_lib/validate';

const PRIORITY_TEXT: Record<(typeof PRIORITIES)[number], string> = {
  Critical: 'Business operations are stopped or multiple people cannot work.',
  High: 'A significant impact with little or no workaround.',
  Normal: 'The issue is affecting work, but you can keep working.',
  Low: 'A general request, question, or non-urgent issue.',
};
const accept = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');
---
<Base
  title="Request Support"
  description={`Send a support request to the ${site.name} help desk. For anything urgent, call ${site.phone.display}.`}
>
  <Fragment slot="head">
    <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  </Fragment>

  <PageHeader
    eyebrow="Support"
    title="How can we"
    accent="help?"
    lead="Tell us what's happening and our team will review your request. The more detail you give us, the faster we can fix it."
  >
    <p class="note">For anything urgent, call <a href={site.phone.href}>{site.phone.display}</a>.</p>
  </PageHeader>

  <section class="section section-alt">
    <div class="container form-wrap">
      <div class="form-banner" role="alert" data-form-error hidden>
        <strong>We couldn't submit your request.</strong>
        Please check the form and try again, or call <a href={site.phone.href}>{site.phone.display}</a> or email
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </div>

      <form data-support-form novalidate aria-label="Support request">
        <fieldset class="form-section">
          <legend>Your information</legend>
          <div class="field-row">
            <div class="field" data-field="name">
              <label for="name">Name<span class="req" aria-hidden="true">*</span></label>
              <input id="name" name="name" type="text" required maxlength="200" autocomplete="name" aria-describedby="err-name" />
              <p class="field-error" id="err-name">Please enter your name.</p>
            </div>
            <div class="field" data-field="company">
              <label for="company">Company or organization</label>
              <input id="company" name="company" type="text" maxlength="200" autocomplete="organization" aria-describedby="err-company" />
              <p class="field-error" id="err-company">Please keep this under 200 characters.</p>
            </div>
          </div>
          <div class="field-row">
            <div class="field" data-field="email">
              <label for="email">Email<span class="req" aria-hidden="true">*</span></label>
              <input id="email" name="email" type="email" required maxlength="254" autocomplete="email" aria-describedby="err-email" />
              <p class="field-error" id="err-email">Please enter a valid email address.</p>
            </div>
            <div class="field" data-field="phone">
              <label for="phone">Phone</label>
              <input id="phone" name="phone" type="tel" maxlength="50" autocomplete="tel" aria-describedby="err-phone" />
              <p class="field-error" id="err-phone">Please keep this under 50 characters.</p>
            </div>
          </div>
          <fieldset class="field choice-group" data-field="preferred_contact_method" aria-describedby="err-preferred_contact_method">
            <legend class="label">Preferred contact method<span class="req" aria-hidden="true">*</span></legend>
            <div class="radio-row">
              {CONTACT_METHODS.map((method, index) => (
                <label class="radio"><input type="radio" name="preferred_contact_method" value={method} checked={index === 0} />{method}</label>
              ))}
            </div>
            <p class="field-error" id="err-preferred_contact_method">Please choose how we should contact you.</p>
          </fieldset>
        </fieldset>

        <fieldset class="form-section">
          <legend>What can we help with?</legend>
          <div class="field" data-field="category">
            <label for="category">Type of request<span class="req" aria-hidden="true">*</span></label>
            <div class="select-wrap">
              <select id="category" name="category" required aria-describedby="err-category">
                <option value="" selected disabled>Select the type of issue</option>
                {SUPPORT_CATEGORIES.map((category) => <option value={category}>{category}</option>)}
              </select>
            </div>
            <p class="field-error" id="err-category">Please choose the type of issue.</p>
          </div>
        </fieldset>

        <fieldset class="form-section" data-field="priority" aria-describedby="err-priority">
          <legend>How urgent is this?</legend>
          <p class="form-section-desc">Choose the option that best describes the impact.</p>
          <div class="priority-grid">
            {PRIORITIES.map((priority) => (
              <label class="priority-card" data-priority={priority}>
                <input type="radio" name="priority" value={priority} checked={priority === 'Normal'} />
                <span class="priority-card-inner">
                  <span class="priority-card-title">{priority}</span>
                  <span class="priority-card-desc">{PRIORITY_TEXT[priority]}</span>
                </span>
              </label>
            ))}
          </div>
          <p class="field-error" id="err-priority">Please choose a priority.</p>
        </fieldset>

        <fieldset class="form-section">
          <legend>Tell us what happened</legend>
          <div class="field" data-field="subject">
            <label for="subject">Brief summary<span class="req" aria-hidden="true">*</span></label>
            <input id="subject" name="subject" type="text" required maxlength="500" placeholder="Example: Outlook will not open" aria-describedby="err-subject" />
            <p class="field-error" id="err-subject">Please give a brief summary (up to 500 characters).</p>
          </div>
          <div class="field" data-field="description">
            <label for="description">Describe the issue<span class="req" aria-hidden="true">*</span></label>
            <textarea id="description" name="description" rows="7" required maxlength="8000" aria-describedby="description-help err-description"></textarea>
            <p class="help" id="description-help">What were you trying to do, what happened, and what did any error message say?</p>
            <p class="field-error" id="err-description">Please describe the issue.</p>
          </div>
          <div class="field" data-field="issue_started">
            <label for="issue_started">When did the issue begin?</label>
            <input id="issue_started" name="issue_started" type="text" maxlength="200" placeholder="Example: This morning around 8:30" aria-describedby="err-issue_started" />
            <p class="field-error" id="err-issue_started">Please keep this under 200 characters.</p>
          </div>
          <fieldset class="field choice-group" data-field="users_affected" aria-describedby="err-users_affected">
            <legend class="label">Who is affected?<span class="req" aria-hidden="true">*</span></legend>
            <div class="radio-row">
              {USERS_AFFECTED.map((option, index) => (
                <label class="radio"><input type="radio" name="users_affected" value={option} checked={index === 0} />{option}</label>
              ))}
            </div>
            <p class="field-error" id="err-users_affected">Please tell us who is affected.</p>
          </fieldset>
          <div class="field" data-field="troubleshooting_attempted">
            <label for="troubleshooting_attempted">What have you already tried?</label>
            <textarea id="troubleshooting_attempted" name="troubleshooting_attempted" rows="4" maxlength="8000" placeholder="Example: Restarted the computer and reopened Outlook." aria-describedby="err-troubleshooting_attempted"></textarea>
            <p class="field-error" id="err-troubleshooting_attempted">Please keep this under 8,000 characters.</p>
          </div>
        </fieldset>

        <fieldset class="form-section" data-field="attachments">
          <legend>Screenshots and attachments</legend>
          <p class="form-section-desc">Screenshots and error messages help us diagnose the issue faster.</p>
          <div class="file-drop" role="button" tabindex="0" data-file-drop data-focus aria-labelledby="file-drop-label" aria-describedby="file-hint err-attachments">
            <input type="file" id="attachments" name="attachments" multiple accept={accept} hidden data-file-input />
            <span class="file-drop-label" id="file-drop-label">Choose files or drag and drop</span>
            <span class="file-drop-hint" id="file-hint">PNG, JPG, GIF, WebP, PDF, text, Word or Excel. Up to {MAX_FILES} files, 10 MB each, 20 MB in total.</span>
          </div>
          <ul class="file-list" data-file-list aria-live="polite"></ul>
          <p class="file-skipped" data-file-skipped aria-live="polite" hidden></p>
          <p class="field-error" id="err-attachments">Please remove files that are too large or of an unsupported type.</p>
          <p class="notice">Please don't upload passwords, authentication codes, credit card numbers, Social Security numbers or other sensitive information.</p>
        </fieldset>

        <fieldset class="form-section">
          <legend>Contact and remote support</legend>
          <div class="field" data-field="best_contact_time">
            <label for="best_contact_time">Best time to contact you</label>
            <input id="best_contact_time" name="best_contact_time" type="text" maxlength="200" placeholder="Example: Weekdays after 2 PM" aria-describedby="err-best_contact_time" />
            <p class="field-error" id="err-best_contact_time">Please keep this under 200 characters.</p>
          </div>
          <div class="field" data-field="remote_support_permission">
            <label class="checkbox">
              <input type="checkbox" id="remote_support_permission" name="remote_support_permission" value="yes" />
              <span>{site.name} may contact me to start a remote support session if remote troubleshooting is needed.</span>
            </label>
          </div>
        </fieldset>

        <div class="honeypot" aria-hidden="true">
          <label for="website">Leave this field empty</label>
          <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
        </div>
        <div class="cf-turnstile turnstile" data-sitekey={site.turnstileSiteKey} data-theme="dark"></div>
        <button class="btn btn-copper btn-block" type="submit">Submit Support Request</button>
      </form>

      <div class="form-success" data-form-success tabindex="-1" hidden>
        <p class="success-mark" aria-hidden="true">✓</p>
        <h2>Your support request has been received.</h2>
        <p>Our team will review it and contact you using your preferred contact method.</p>
        <p data-ticket-line hidden>Your ticket number is<span class="ticket-badge" data-ticket-number></span></p>
        <div class="btn-row btn-row--center">
          <button type="button" class="btn btn-ice" data-submit-another>Submit another request</button>
          <a class="btn btn-copper" href="/">Return home</a>
        </div>
      </div>
    </div>
  </section>

  <script>
    import '../scripts/support-form';
  </script>
</Base>
```

- [ ] **Step 3: Build and check**

Run:

```bash
npm run build
grep -o 'class="priority-card"' dist/support.html | wc -l
grep -o '<option value="[^"]*"' dist/support.html | wc -l
grep -o 'accept="[^"]*"' dist/support.html
grep -o 'For anything urgent, call <a href="tel:+19892004814">' dist/support.html | wc -l
grep -o 'portal\.' dist/support.html | wc -l
```

Expected:
- `4` priority cards.
- `11` options (the placeholder plus 10 categories).
- `accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx"`.
- `1` urgent-call note.
- `0` references to `portal.`.

- [ ] **Step 4: Type-check and commit**

Run: `npm run check` → `0 errors`.

```bash
git add src/scripts/support-form.ts src/pages/support.astro
git commit -m "Add Support page with ticket request form

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Privacy and 404 pages

**Files:**
- Create: `src/pages/privacy.astro`, `src/pages/404.astro`
- Test: `npm run verify` (all checks, including `check:dist`, which must now pass)

**Interfaces:**
- Consumes: `Base` (with `noindex`), `PageHeader` (Tasks 7–8); `site` (Task 6).

- [ ] **Step 1: Write the privacy policy**

`src/pages/privacy.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import PageHeader from '../components/PageHeader.astro';
import { site } from '../config/site';

// Update at launch if the site goes live on a different date (docs/setup.md, step 7).
const effective = 'November 12, 2026';
const host = new URL(site.url).host;
---
<Base title="Privacy Policy" description={`How ${site.name} collects, uses and protects the information you share with us.`}>
  <PageHeader
    eyebrow="Privacy"
    title="Privacy"
    accent="Policy"
    lead={`Effective ${effective}. This policy explains what ${site.name} collects through this website and how we use it.`}
  />
  <section class="section section-alt">
    <div class="container prose">
      <h2>Who we are</h2>
      <p>{site.name} is {site.endorsement}. {site.legalName} ("we", "us") runs this website, {host}.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Contact form:</strong> your name and email address, plus anything else you choose to give us — company, phone number, the service you're interested in and your message.</li>
        <li><strong>Support form:</strong> your contact details, the details of your issue, any files you attach, and whether we may start a remote support session.</li>
        <li><strong>Booking a call:</strong> Microsoft Bookings collects your name, email address, phone number and the time you choose.</li>
        <li><strong>Email and phone:</strong> whatever you send or tell us.</li>
      </ul>
      <p>This site does not use advertising or tracking cookies. We count visits with Cloudflare Web Analytics, which measures page views without cookies and without identifying you. Our forms use Cloudflare Turnstile to check that a person, not a bot, is submitting them; Turnstile looks at technical information from your browser to do this.</p>

      <h2>How we use it</h2>
      <p>We use your information to answer you, schedule calls, provide and support our services, and keep this site secure. We do not sell your information or share it for advertising.</p>

      <h2>Where it is processed</h2>
      <ul>
        <li>Cloudflare delivers this website and runs Turnstile and Web Analytics.</li>
        <li>Form submissions become tickets in our help desk, which runs on servers we operate.</li>
        <li>Microsoft 365 provides our email and Microsoft Bookings.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>We keep messages and support tickets for as long as we need them to serve you and to meet legal and accounting obligations, then delete them.</p>

      <h2>Your choices</h2>
      <p>You can ask to see, correct or delete the information we hold about you by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.</p>

      <h2>Children</h2>
      <p>This site is meant for businesses and is not directed to children under 13.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update this page and its effective date.</p>

      <h2>Contact</h2>
      <p>
        {site.legalName}, {site.location.city}, {site.location.regionName} ·
        <a href={site.phone.href}>{site.phone.display}</a> ·
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </div>
  </section>
</Base>
```

- [ ] **Step 2: Write the 404 page**

`src/pages/404.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import PageHeader from '../components/PageHeader.astro';
---
<Base title="Page not found" description="The page you were looking for could not be found." noindex>
  <PageHeader eyebrow="404" title="We couldn't find that" accent="page." lead="The link may be old or mistyped. Try one of these instead.">
    <div class="btn-row">
      <a class="btn btn-copper" href="/">Home</a>
      <a class="btn btn-ice" href="/services">Services</a>
      <a class="btn btn-ice" href="/contact">Contact</a>
    </div>
  </PageHeader>
</Base>
```

- [ ] **Step 3: Run every check**

Run: `npm run verify`
Expected:
- `astro check` reports 0 errors.
- All Vitest files pass.
- The build completes.
- `check-dist: 11 page(s) OK`. The 11 are index, services, the four service pages, about, contact, support, privacy and 404.

Then run:

```bash
grep -o '<meta name="robots" content="noindex"' dist/404.html | wc -l
grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml
```

Expected: `1`. The sitemap lists 10 URLs with no trailing slash (apart from the root `https://getproedge.org/`), and `/404` is not among them.

- [ ] **Step 4: Commit**

```bash
git add src/pages/privacy.astro src/pages/404.astro
git commit -m "Add Privacy Policy and 404 pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Social share image

**Files:**
- Create: `scripts/og/og-image.html`, `scripts/og/mark.png` (copy of the brand mark), `public/og-image.png` (rendered)
- Test: image is exactly 1200×630 and looks right

**Interfaces:**
- Produces: `public/og-image.png`, referenced by `Base.astro` (Task 7) for `og:image` and JSON-LD.

- [ ] **Step 1: Copy the mark and write the template**

```bash
cp "../Brand Guidelines/icons/mark-for-dark-bg-1024.png" scripts/og/mark.png
```

`scripts/og/og-image.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Michroma&family=Quantico:wght@700&display=block">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: #0F1420; color: #F6F8FB; font-family: 'Quantico', sans-serif; }
  body::before {
    content: ''; position: absolute; inset: 0;
    background-image: linear-gradient(rgba(154,232,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(154,232,247,0.04) 1px, transparent 1px);
    background-size: 56px 56px;
  }
  .glow { position: absolute; right: -120px; top: -120px; width: 700px; height: 600px; background: radial-gradient(ellipse, rgba(47,143,168,0.22) 0%, transparent 60%); }
  .wrap { position: absolute; inset: 0; display: flex; align-items: center; gap: 64px; padding: 0 96px; }
  .mark { width: 220px; height: 220px; }
  .wordmark { font-family: 'Michroma', monospace; font-size: 52px; letter-spacing: 0.06em; white-space: nowrap; }
  .slash { color: #9AE8F7; margin: 0 4px; }
  .edge { color: #C3CAD4; }
  .endorse { margin-top: 18px; font-size: 24px; color: #C3CAD4; letter-spacing: 0.08em; }
  .tagline { margin-top: 36px; font-size: 20px; letter-spacing: 0.3em; text-transform: uppercase; color: #9AE8F7; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: #2F8FA8; }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="wrap">
    <img class="mark" src="mark.png" alt="">
    <div>
      <div class="wordmark">GET PRO<span class="slash">/</span><span class="edge">edge</span></div>
      <div class="endorse">a Progressive Edge company</div>
      <div class="tagline">ai / technology / people</div>
    </div>
  </div>
  <div class="bar"></div>
</body>
</html>
```

- [ ] **Step 2: Render it with headless Edge (PowerShell)**

```powershell
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$repo = "D:\-- Progressive Edge LLC\pe-website"
$src = [System.Uri]::new("$repo\scripts\og\og-image.html").AbsoluteUri
& $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=8000 "--screenshot=$repo\public\og-image.png" $src
```

Expected: `public/og-image.png` is written. Edge may print a few harmless log lines.

- [ ] **Step 3: Check the size and look at it**

```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("D:\-- Progressive Edge LLC\pe-website\public\og-image.png")
"$($img.Width)x$($img.Height)"
$img.Dispose()
```

Expected: `1200x630`. If the height is short, raise the second `--window-size` number by the shortfall and render again.

Then open `public/og-image.png` with the Read tool and confirm the following:
- The P/e mark is on the left.
- "GET PRO/edge" is in Michroma, not a fallback font.
- The endorsement and tagline are visible.
- Nothing is clipped on the right.
- The ice bar runs along the bottom.

- [ ] **Step 4: Build check and commit**

Run: `npm run build && npm run check:dist` → `check-dist: 11 page(s) OK`.

```bash
git add scripts/og/og-image.html scripts/og/mark.png public/og-image.png
git commit -m "Add social share image

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: n8n workflows

**Files:**
- Create: `n8n/contact-to-zammad.json`, `n8n/support-to-zammad.json`
- Test: `tests/n8n.test.ts` (runs each workflow's "Build ticket" Code node against sample input and checks the wiring)

**Interfaces:**
- Consumes:
  - The multipart fields that Task 5 forwards. Text fields arrive in the webhook item's `json.body`, and files arrive as binary properties `attachment_1`…`attachment_5`.
  - The headers: `X-PE-Webhook-Secret`.
- Produces:
  - The webhook paths `website-contact` and `website-support`. Their URLs are `https://n8n.getproedge.org/webhook/website-contact` and `https://n8n.getproedge.org/webhook/website-support`.
  - Responses: `{ ok: true }` (contact), `{ ok: true, ticketNumber }` (support), and `502 { ok: false }` when Zammad fails.
  - Zammad calls go to `http://zammad-nginx:8080/api/v1/tickets` (internal Docker address; n8n and zammad-nginx share the `proxy` and `data` networks).
- Credentials are set by the owner after import (`docs/setup.md`): Header Auth "Website webhook secret" and Header Auth "Zammad API token".

- [ ] **Step 1: Write the failing test**

`tests/n8n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

interface N8nNode {
  name: string;
  type: string;
  parameters: Record<string, any>;
  onError?: string;
}
interface Workflow {
  nodes: N8nNode[];
  connections: Record<string, { main: { node: string }[][] }>;
}
interface Item {
  json: { body: Record<string, string> };
  binary?: Record<string, { fileName: string; mimeType: string }>;
}

const load = (file: string): Workflow => JSON.parse(readFileSync(new URL(`../n8n/${file}`, import.meta.url), 'utf8'));

function node(wf: Workflow, name: string): N8nNode {
  const found = wf.nodes.find((n) => n.name === name);
  if (!found) throw new Error(`missing node "${name}"`);
  return found;
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

/** Runs a workflow's "Build ticket" Code node the way n8n does: $input in scope, helpers on `this`. */
async function buildTicket(file: string, item: Item, buffers: Record<string, Buffer> = {}) {
  const run = new AsyncFunction('$input', node(load(file), 'Build ticket').parameters.jsCode as string);
  const context = { helpers: { getBinaryDataBuffer: async (_index: number, key: string) => buffers[key] } };
  const output = (await run.call(context, { first: () => item })) as [{ json: { ticket: Record<string, any> } }];
  return output[0].json.ticket;
}

describe('contact workflow', () => {
  const body = {
    name: 'Pat Doe',
    email: 'pat@example.com',
    company: 'Acme',
    phone: '',
    service: 'AI & Automation',
    message: 'We miss calls.',
    submitted_at: '2026-11-12T15:00:00.000Z',
  };

  it('builds a Sales ticket with every filled-in detail', async () => {
    const ticket = await buildTicket('contact-to-zammad.json', { json: { body } });
    expect(ticket.title).toBe('Website lead: Pat Doe — AI & Automation');
    expect(ticket.group).toBe('Sales');
    expect(ticket.customer_id).toBe('guess:pat@example.com');
    expect(ticket.article).toMatchObject({ type: 'web', sender: 'Customer', internal: false, content_type: 'text/plain' });
    expect(ticket.article.body).toBe(
      'Name: Pat Doe\nEmail: pat@example.com\nCompany: Acme\nService: AI & Automation\nSubmitted: 2026-11-12T15:00:00.000Z\n\nWe miss calls.',
    );
  });

  it('falls back to "Not sure yet" when no service was chosen', async () => {
    const ticket = await buildTicket('contact-to-zammad.json', { json: { body: { ...body, service: '' } } });
    expect(ticket.title).toBe('Website lead: Pat Doe — Not sure yet');
  });
});

describe('support workflow', () => {
  const body = {
    name: 'Pat Doe',
    company: 'Acme',
    email: 'pat@example.com',
    phone: '989-555-0100',
    preferred_contact_method: 'Phone',
    category: 'Hardware',
    priority: 'Normal',
    subject: 'Server down',
    description: 'Nobody can sign in.',
    issue_started: 'This morning',
    users_affected: 'Everyone',
    troubleshooting_attempted: 'Restarted it',
    best_contact_time: 'Any time',
    remote_support_permission: 'yes',
    submitted_at: '2026-11-12T15:00:00.000Z',
  };
  const supportTicket = (
    overrides: Record<string, string> = {},
    binary?: Item['binary'],
    buffers: Record<string, Buffer> = {},
  ) => buildTicket('support-to-zammad.json', { json: { body: { ...body, ...overrides } }, binary }, buffers);

  it.each([
    ['Critical', '3 high', 'critical'],
    ['High', '3 high', undefined],
    ['Normal', '2 normal', undefined],
    ['Low', '1 low', undefined],
  ])('maps priority %s to "%s"', async (priority, zammadPriority, tag) => {
    const ticket = await supportTicket({ priority });
    expect(ticket.priority).toBe(zammadPriority);
    expect(ticket.tags).toBe(tag);
  });

  it('puts the request in the Support group with every detail in the body', async () => {
    const ticket = await supportTicket();
    expect(ticket.title).toBe('Server down');
    expect(ticket.group).toBe('Support');
    expect(ticket.customer_id).toBe('guess:pat@example.com');
    expect(ticket.article.body).toContain('Preferred contact: Phone');
    expect(ticket.article.body).toContain('Who is affected: Everyone');
    expect(ticket.article.body).toContain('Remote support allowed: Yes');
    expect(ticket.article.body).toContain('Description:\nNobody can sign in.');
    expect(ticket.article.body).toContain('Already tried:\nRestarted it');
    expect(ticket.article.attachments).toEqual([]);
  });

  it('says No to remote support and drops empty details', async () => {
    const ticket = await supportTicket({ remote_support_permission: '', troubleshooting_attempted: '', phone: '' });
    expect(ticket.article.body).toContain('Remote support allowed: No');
    expect(ticket.article.body).not.toContain('Already tried');
    expect(ticket.article.body).not.toContain('Phone:');
  });

  it('base64-encodes attachment_N files in order and ignores other binaries', async () => {
    const ticket = await supportTicket(
      {},
      {
        attachment_2: { fileName: 'error.txt', mimeType: 'text/plain' },
        attachment_1: { fileName: 'screen.png', mimeType: 'image/png' },
        data: { fileName: 'stray.bin', mimeType: 'application/octet-stream' },
      },
      { attachment_1: Buffer.from('png-bytes'), attachment_2: Buffer.from('log') },
    );
    expect(ticket.article.attachments).toEqual([
      { filename: 'screen.png', data: Buffer.from('png-bytes').toString('base64'), 'mime-type': 'image/png' },
      { filename: 'error.txt', data: Buffer.from('log').toString('base64'), 'mime-type': 'text/plain' },
    ]);
  });

  it('returns the Zammad ticket number to the website', () => {
    expect(node(load('support-to-zammad.json'), 'Respond OK').parameters.responseBody).toContain(
      'ticketNumber: String($json.number)',
    );
  });
});

describe.each([
  ['contact-to-zammad.json', 'website-contact'],
  ['support-to-zammad.json', 'website-support'],
])('%s wiring', (file, path) => {
  const wf = load(file);
  const hook = wf.nodes.find((n) => n.type === 'n8n-nodes-base.webhook');

  it('listens on the right path with header auth and a response node', () => {
    expect(hook?.parameters).toMatchObject({
      httpMethod: 'POST',
      path,
      authentication: 'headerAuth',
      responseMode: 'responseNode',
    });
  });

  it('runs webhook → Build ticket → Create Zammad ticket', () => {
    expect(wf.connections[hook?.name ?? ''].main[0][0].node).toBe('Build ticket');
    expect(wf.connections['Build ticket'].main[0][0].node).toBe('Create Zammad ticket');
  });

  it('creates the ticket through the internal Zammad address', () => {
    const http = node(wf, 'Create Zammad ticket');
    expect(http.parameters.url).toBe('http://zammad-nginx:8080/api/v1/tickets');
    expect(http.parameters.authentication).toBe('genericCredentialType');
    expect(http.parameters.genericAuthType).toBe('httpHeaderAuth');
    expect(http.onError).toBe('continueErrorOutput');
  });

  it('answers 502 when Zammad fails', () => {
    const outputs = wf.connections['Create Zammad ticket'].main;
    expect(outputs[0][0].node).toBe('Respond OK');
    expect(outputs[1][0].node).toBe('Respond error');
    expect(node(wf, 'Respond error').parameters.options.responseCode).toBe(502);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/n8n.test.ts`
Expected: FAIL — `ENOENT` reading `n8n/contact-to-zammad.json`.

- [ ] **Step 3: Write `n8n/contact-to-zammad.json`**

```json
{
  "name": "Website contact → Zammad (Sales)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "website-contact",
        "authentication": "headerAuth",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "7c1e4a20-1d2b-4c3d-9e8f-0a1b2c3d4e01",
      "name": "Website contact",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [0, 0],
      "webhookId": "3f6b8d2a-5c4e-4b1a-9d7f-2e8c6a4b1d01"
    },
    {
      "parameters": {
        "jsCode": "// Shape the website contact form into a Zammad ticket for the Sales group.\nconst f = $input.first().json.body || {};\nconst clean = (v) => String(v ?? '').trim();\nconst name = clean(f.name);\nconst service = clean(f.service) || 'Not sure yet';\nconst details = [\n  ['Name', name],\n  ['Email', clean(f.email)],\n  ['Company', clean(f.company)],\n  ['Phone', clean(f.phone)],\n  ['Service', service],\n  ['Submitted', clean(f.submitted_at)],\n]\n  .filter(([, value]) => value !== '')\n  .map(([label, value]) => `${label}: ${value}`);\nreturn [{\n  json: {\n    ticket: {\n      title: `Website lead: ${name} — ${service}`,\n      group: 'Sales',\n      customer_id: `guess:${clean(f.email)}`,\n      article: {\n        subject: `Website lead: ${name}`,\n        body: `${details.join('\\n')}\\n\\n${clean(f.message)}`,\n        type: 'web',\n        sender: 'Customer',\n        internal: false,\n        content_type: 'text/plain',\n      },\n    },\n  },\n}];"
      },
      "id": "7c1e4a20-1d2b-4c3d-9e8f-0a1b2c3d4e02",
      "name": "Build ticket",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://zammad-nginx:8080/api/v1/tickets",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.ticket) }}",
        "options": { "timeout": 15000 }
      },
      "id": "7c1e4a20-1d2b-4c3d-9e8f-0a1b2c3d4e03",
      "name": "Create Zammad ticket",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [440, 0],
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ ok: true }) }}",
        "options": {}
      },
      "id": "7c1e4a20-1d2b-4c3d-9e8f-0a1b2c3d4e04",
      "name": "Respond OK",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [660, -80]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ ok: false }) }}",
        "options": { "responseCode": 502 }
      },
      "id": "7c1e4a20-1d2b-4c3d-9e8f-0a1b2c3d4e05",
      "name": "Respond error",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [660, 100]
    }
  ],
  "connections": {
    "Website contact": { "main": [[{ "node": "Build ticket", "type": "main", "index": 0 }]] },
    "Build ticket": { "main": [[{ "node": "Create Zammad ticket", "type": "main", "index": 0 }]] },
    "Create Zammad ticket": {
      "main": [
        [{ "node": "Respond OK", "type": "main", "index": 0 }],
        [{ "node": "Respond error", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": { "executionOrder": "v1" },
  "pinData": {}
}
```

- [ ] **Step 4: Write `n8n/support-to-zammad.json`**

```json
{
  "name": "Website support → Zammad (Support)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "website-support",
        "authentication": "headerAuth",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "8d2f5b31-2e3c-4d4e-af90-1b2c3d4e5f01",
      "name": "Website support",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [0, 0],
      "webhookId": "4a7c9e3b-6d5f-4c2b-8e9a-3f9d7b5c2e02"
    },
    {
      "parameters": {
        "jsCode": "// Shape the website support form into a Zammad ticket for the Support group.\nconst item = $input.first();\nconst f = item.json.body || {};\nconst clean = (v) => String(v ?? '').trim();\nconst PRIORITY = { Critical: '3 high', High: '3 high', Normal: '2 normal', Low: '1 low' };\nconst priority = clean(f.priority);\nconst details = [\n  ['Name', f.name],\n  ['Company', f.company],\n  ['Email', f.email],\n  ['Phone', f.phone],\n  ['Preferred contact', f.preferred_contact_method],\n  ['Best time to contact', f.best_contact_time],\n  ['Category', f.category],\n  ['Priority', priority],\n  ['Who is affected', f.users_affected],\n  ['Issue began', f.issue_started],\n  ['Remote support allowed', clean(f.remote_support_permission) === 'yes' ? 'Yes' : 'No'],\n  ['Submitted', f.submitted_at],\n]\n  .map(([label, value]) => [label, clean(value)])\n  .filter(([, value]) => value !== '')\n  .map(([label, value]) => `${label}: ${value}`);\nconst sections = [details.join('\\n'), `Description:\\n${clean(f.description)}`];\nif (clean(f.troubleshooting_attempted)) sections.push(`Already tried:\\n${clean(f.troubleshooting_attempted)}`);\n\n// Files arrive as binary properties attachment_1 ... attachment_5; Zammad wants base64.\nconst attachments = [];\nconst keys = Object.keys(item.binary || {}).filter((key) => key.startsWith('attachment_')).sort();\nfor (const key of keys) {\n  const meta = item.binary[key];\n  const buffer = await this.helpers.getBinaryDataBuffer(0, key);\n  attachments.push({\n    filename: meta.fileName || key,\n    data: buffer.toString('base64'),\n    'mime-type': meta.mimeType || 'application/octet-stream',\n  });\n}\n\nconst ticket = {\n  title: clean(f.subject),\n  group: 'Support',\n  customer_id: `guess:${clean(f.email)}`,\n  priority: PRIORITY[priority] || '2 normal',\n  article: {\n    subject: clean(f.subject),\n    body: sections.join('\\n\\n'),\n    type: 'web',\n    sender: 'Customer',\n    internal: false,\n    content_type: 'text/plain',\n    attachments,\n  },\n};\nif (priority === 'Critical') ticket.tags = 'critical';\nreturn [{ json: { ticket } }];"
      },
      "id": "8d2f5b31-2e3c-4d4e-af90-1b2c3d4e5f02",
      "name": "Build ticket",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://zammad-nginx:8080/api/v1/tickets",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.ticket) }}",
        "options": { "timeout": 30000 }
      },
      "id": "8d2f5b31-2e3c-4d4e-af90-1b2c3d4e5f03",
      "name": "Create Zammad ticket",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [440, 0],
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ ok: true, ticketNumber: String($json.number) }) }}",
        "options": {}
      },
      "id": "8d2f5b31-2e3c-4d4e-af90-1b2c3d4e5f04",
      "name": "Respond OK",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [660, -80]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ ok: false }) }}",
        "options": { "responseCode": 502 }
      },
      "id": "8d2f5b31-2e3c-4d4e-af90-1b2c3d4e5f05",
      "name": "Respond error",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [660, 100]
    }
  ],
  "connections": {
    "Website support": { "main": [[{ "node": "Build ticket", "type": "main", "index": 0 }]] },
    "Build ticket": { "main": [[{ "node": "Create Zammad ticket", "type": "main", "index": 0 }]] },
    "Create Zammad ticket": {
      "main": [
        [{ "node": "Respond OK", "type": "main", "index": 0 }],
        [{ "node": "Respond error", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": { "executionOrder": "v1" },
  "pinData": {}
}
```

- [ ] **Step 5: Run it to make sure it passes**

Run: `npx vitest run tests/n8n.test.ts`
Expected: PASS (18 tests). If a "Build ticket" test throws a `SyntaxError`, the problem is the JSON escaping of `jsCode`. Inside the JSON string, every JavaScript `\n` must be written `\\n`, and every real line break must be `\n`.

- [ ] **Step 6: Run everything and commit**

Run: `npm test && npm run check` → all pass, `0 errors`.

```bash
git add n8n/contact-to-zammad.json n8n/support-to-zammad.json tests/n8n.test.ts
git commit -m "Add n8n workflows that turn form submissions into Zammad tickets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Owner setup guide and removal of the old site

**Files:**
- Create: `docs/setup.md`
- Delete: `index.html`, `CNAME`, `support/request.html` (the last only after the owner says yes — see Step 3)
- Test: `npm run verify`

**Interfaces:**
- Consumes:
  - The environment variable names from Task 5.
  - The webhook paths and credential names from Task 15.
  - The `bookingUrl` and `turnstileSiteKey` fields from Task 6.

- [ ] **Step 1: Write `docs/setup.md`**

````markdown
# Get Pro Edge website — owner setup

Do these once. Step 1 must be done **before the `feature/getproedge-site` branch is first pushed**.

## 1. Cloudflare Pages build settings

Cloudflare dashboard → Workers & Pages → the project that deploys `ProgressiveEdge/ProgressiveEdgeLLC.com` → Settings.

Build:
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`

Variables and Secrets — add each to **both Production and Preview**:

| Name | Type | Value |
|---|---|---|
| `NODE_VERSION` | Text | `24` |
| `TURNSTILE_SECRET_KEY` | Secret | from step 2 |
| `N8N_CONTACT_WEBHOOK_URL` | Text | `https://n8n.getproedge.org/webhook/website-contact` |
| `N8N_SUPPORT_WEBHOOK_URL` | Text | `https://n8n.getproedge.org/webhook/website-support` |
| `N8N_WEBHOOK_SECRET` | Secret | a long random value — in Git Bash: `openssl rand -hex 32`. Keep it for step 5. |

After this change a push to `main` fails to build until the branch is merged. Production keeps serving the last good deployment, so the current site stays up.

## 2. Cloudflare Turnstile

Cloudflare dashboard → Turnstile → Add widget.
- Name: `getproedge.org forms`
- Hostnames: `getproedge.org` and your Pages project's `<project>.pages.dev`
- Widget mode: Managed

Copy the keys:
- **Site key** → `src/config/site.ts` → `turnstileSiteKey` (replace the test key `1x00000000000000000000AA`), then commit.
- **Secret key** → Pages `TURNSTILE_SECRET_KEY`.

If a form on a preview address says verification failed, add that preview's full hostname to the widget.

## 3. Microsoft Bookings

Microsoft 365 → Bookings → create the booking page (service, staff, hours). Publish it, then copy the public page URL into `src/config/site.ts` → `bookingUrl` and commit. Until it is set, every Book a Call button goes to /contact.

## 4. Zammad (https://support.getproedge.org)

1. Admin → Groups → **New**: `Sales`. Make sure a `Support` group exists too.
2. Admin → System → API → turn on **API Token Access**.
3. Pick the agent account the website acts through (a dedicated "Website" agent is cleanest). Give it agent access to **Sales** and **Support**.
4. Signed in as that agent: avatar → Profile → Token Access → **Create**. Name: `n8n website forms`. Permission: `ticket.agent`. Copy the token.

## 5. n8n (https://n8n.getproedge.org)

Credentials → **Add credential** (type **Header Auth**) twice:

| Credential name | Header name | Value |
|---|---|---|
| Website webhook secret | `X-PE-Webhook-Secret` | the `N8N_WEBHOOK_SECRET` from step 1 |
| Zammad API token | `Authorization` | `Token token=<token from step 4>` |

Workflows → **Import from file**: `n8n/contact-to-zammad.json`, then `n8n/support-to-zammad.json`. In each workflow:
1. Open the webhook node → Credential: **Website webhook secret**.
2. Open **Create Zammad ticket** → Credential: **Zammad API token**.
3. Save, then **Publish / Activate**. Changes only take effect once published.

The production webhook URLs must match step 1: `/webhook/website-contact` and `/webhook/website-support`.

## 6. Mailbox

Create `info@getproedge.org` in the Microsoft 365 admin center, as a mailbox, shared mailbox or alias. Mail for getproedge.org already routes to Microsoft 365.

## 7. Go live (after the branch is merged to `main`)

1. Pages project → Custom domains → add `getproedge.org` and `www.getproedge.org`.
2. **getproedge.org** zone → Rules → Redirect Rules → Create:
   - Name: `www to apex`
   - When: Hostname equals `www.getproedge.org`
   - Then: Dynamic redirect to `concat("https://getproedge.org", http.request.uri.path)`, status **301**, preserve query string.
3. **progressiveedgellc.com** zone → Rules → Redirect Rules → Create:
   - Name: `old site to getproedge.org`
   - When: (Hostname equals `progressiveedgellc.com`) **or** (Hostname equals `www.progressiveedgellc.com`)
   - Then: Dynamic redirect to `concat("https://getproedge.org", http.request.uri.path)`, status **301**, preserve query string.

   Keep the existing proxied (orange-cloud) DNS records for those two names, so the rule can fire. Don't match any other progressiveedgellc.com hostname, such as voice, mesh or mail.
4. Pages project → Metrics → **Web Analytics** → enable. It is cookieless.
5. If the launch date isn't November 12, 2026, update `effective` in `src/pages/privacy.astro`.

## Rollback

Pages project → Deployments → the previous production deployment → ⋯ → **Rollback to this deployment**.

## Known limits and open items

- Cloudflare's free Workers plan allows 10 ms of CPU per request. Reading a support request with large attachments may go over that, and the form then shows its error banner. If it happens, turn on **Workers Paid** ($5/month) in the Cloudflare account, which raises the limit.
- The privacy policy is a plain-language draft, not legal advice.
- The assumed name filed with Michigan must read "Get Pro Edge" before launch. Schedule C of the draft operating agreement says "Go Pro Edge".
- Stacey should confirm she is comfortable publishing the figures in her bio, and both owners should review the drafted service copy.
- "Free consultation" wording is carried over from the old site. Confirm it stays free.
````

- [ ] **Step 2: Remove the old homepage and GitHub Pages leftover**

```bash
git rm index.html CNAME
```

Expected: `rm 'index.html'`, `rm 'CNAME'`.

- [ ] **Step 3: Ask the owner before removing the old support form**

`support/request.html` has an **uncommitted edit by the owner** (its API URL). Deleting the file discards that edit. Ask, in these words:

> "The new /support page replaces `support/request.html`. OK to delete it, including your uncommitted edit to its API URL?"

Only after a clear yes, run:

```bash
git rm -f support/request.html
```

If the owner says no, skip this step. Leave the file and note it in the Task 17 report. `/support/request.html` still redirects to `/support` through `public/_redirects`.

- [ ] **Step 4: Run every check**

Run: `npm run verify`
Expected: all pass, and `check-dist: 11 page(s) OK`.

- [ ] **Step 5: Commit**

```bash
git add docs/setup.md
git commit -m "Add owner setup guide and remove the old static site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(The `git rm` changes from Steps 2–3 are already staged and go in the same commit.) Then run `git status --short`. The only entries left should be `?? docs/superpowers/plans/2026-10-14-support-request-form.md`, plus ` M support/request.html` if the owner kept it.

---

### Task 17: Verification, preview deploy and launch

**Files:** none changed unless a check fails. Fix failures in the task that owns the file, re-run `npm run verify`, and commit the fix.

- [ ] **Step 1: Full local check**

Run: `npm run verify`
Expected:
- `astro check` reports 0 errors.
- Every Vitest file passes: paths, validate, turnstile, forward, handle, data, n8n.
- The build completes.
- `check-dist: 11 page(s) OK`.

- [ ] **Step 2: Get the owner's go-ahead to push**

Ask: "All local checks pass. Have you finished step 1 of `docs/setup.md` (Pages build settings and secrets)? OK to push `feature/getproedge-site` to GitHub for a preview build?" Wait for a clear yes.

- [ ] **Step 3: Push the branch**

```bash
git push -u origin feature/getproedge-site
```

If GitHub answers "Repository not found", the credential manager picked the wrong account. Push with the account in the URL:

```bash
git push -u https://ProgressiveEdge@github.com/ProgressiveEdge/ProgressiveEdgeLLC.com.git feature/getproedge-site
```

Expected: the branch is pushed, and Cloudflare starts a preview build. The preview address is `https://feature-getproedge-site.<project>.pages.dev`; ask the owner for `<project>` if it isn't known.

- [ ] **Step 4: Browser checks on the preview (built-in browser)**

Use the built-in browser's `resize_window` for narrow widths. Don't use headless Edge screenshots: headless Edge won't go narrower than 492px, and it crops the image instead, which looks like a horizontal-scroll bug that isn't there.

For every page, at widths **375**, **768** and **1280** (`resize_window`, then reset to the desktop preset when done):
- Pages to check: `/`, `/services`, the four service pages, `/about`, `/contact`, `/support`, `/privacy`, and a missing page such as `/nope`.
- Layout: there's no horizontal scroll, the text is readable, the cards line up, and the founder photos crop sensibly (faces visible).
- The menu at 375:
  - The button opens the menu.
  - Tab moves through the links.
  - Escape closes the menu and returns focus to the button.
  - A link click closes it.
- Motion: sections fade in on scroll. With reduced motion emulated (or checked in the OS), nothing animates.
- Phone and email are links (`tel:` and `mailto:`).
- The 404 page shows the "We couldn't find that page." header.

- [ ] **Step 5: Accessibility scan on every page**

On each page, run with `javascript_tool`:

```js
await new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
  s.onload = resolve;
  s.onerror = reject;
  document.head.appendChild(s);
});
const result = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] });
result.violations
  .filter((v) => v.impact === 'serious' || v.impact === 'critical')
  .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')) }));
```

Expected: `[]` on every page. Then do a keyboard-only pass through the nav and both forms. The skip link should appear on the first Tab, every control should show a focus ring, the priority cards should work with the arrow keys, and the file drop should open on Enter.

- [ ] **Step 6: Form behaviour on the preview**

Before the owner finishes steps 2–5 of `docs/setup.md`, the forms answer `500 {error:"config"}`. Confirm that each form then shows its error banner with the phone number and email, and that the typed data is kept.

After the owner confirms steps 2–5 are done and the real Turnstile site key is committed and pushed, run these end-to-end tests:
1. **Contact:** submit `Test — please delete` / your own test address / service "Not sure yet". Expect the thank-you message, and a new ticket in Zammad's **Sales** group titled `Website lead: Test — please delete — Not sure yet`.
2. **Support:** submit with priority **Critical**, one small PNG attached. Expect the success panel with a ticket number. That number's ticket should be in the **Support** group with priority `3 high`, tag `critical`, and the PNG attached.
3. **Large upload:** submit a support request with three files totalling about 18 MB. If it fails with the error banner while small uploads work, report the Workers CPU limit (`docs/setup.md`, Known limits) to the owner.
4. **Validation:** submit each form empty. The fields are marked, focus moves to the first one, and nothing is sent.

Ask the owner to delete the test tickets in Zammad. Don't delete them yourself: deleting is permanent.

- [ ] **Step 7: Merge (owner's call)**

When the owner approves the preview, open a pull request from `feature/getproedge-site` to `main` (or merge, as the owner prefers). Merging deploys production.

- [ ] **Step 8: After go-live, check the redirects**

Once the owner has done step 7 of `docs/setup.md`:

```bash
for u in https://getproedge.org/support/request.html https://www.getproedge.org/about https://progressiveedgellc.com/about https://www.progressiveedgellc.com/; do
  printf '%s -> ' "$u"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$u"
done
curl -s -o /dev/null -w 'voice: %{http_code}\n' https://progressive-edge.voice.getproedge.org/
curl -s -o /dev/null -w 'mesh: %{http_code}\n' https://mesh.progressiveedgellc.com/health.ashx
```

Expected:
- Each of the four URLs answers `301` and points to the matching `https://getproedge.org/...` page.
- `voice` and `mesh` answer as they did before launch, not with a redirect to getproedge.org.

- [ ] **Step 9: Report**

Tell the owner:
- What passed.
- Anything that failed and how it was fixed.
- Whether `support/request.html` was removed.
- The remaining open items from `docs/setup.md` ("Known limits and open items").

---

## Self-Review Notes

- **Spec coverage:**
  - §2 identity → Task 6. §3 site map, nav and footer → Tasks 7–13. §4 page content → Tasks 8–13.
  - §5 visual design → Task 7 and Task 14. §6 architecture → File Map. §7 forms → Tasks 2–5, 11, 12, 15.
  - §8 SEO → Task 7 (meta, JSON-LD), Task 1 (sitemap), Task 7 (robots).
  - §9 deployment → Task 16 (`docs/setup.md`) and Task 17. §10 testing → Tasks 1–6, 15, 17.
- **Deliberate deviations from the spec text, recorded in the spec on 2026-11-12:**
  - Node 24 instead of 22.
  - Multipart forwarding to n8n instead of JSON with base64.
  - A `500 {error:"config"}` answer when a secret is missing.
  - Tests live in `tests/`.
- **Not unit-tested in the browser:** the DOM behaviour of `nav.ts`, `reveal.ts`, `contact-form.ts` and `support-form.ts`. Their validation logic is the shared, tested `validate.ts`; their behaviour is checked by hand in Task 17.
