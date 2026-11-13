// Checks the built site in dist/:
//  1. every root-relative href/src points to a file that exists,
//  2. internal links have no trailing slash and no .html,
//  3. no banned text appears on any page,
//  4. every Turnstile widget has a real site key (not empty, not a Cloudflare test key),
//  5. the contact and support forms match the rules the Worker enforces.
// Wrangler runs it after every build (wrangler.jsonc), so a failure stops the deploy.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { ALLOWED_EXTENSIONS, CONTACT_RULES, SUPPORT_RULES } from '../functions/_lib/validate.ts';
import {
  contractProblems,
  fileInputProblems,
  findForm,
  formControls,
  siteKeyProblems,
  turnstileSiteKeys,
} from './dist-checks.mjs';

const DIST = 'dist';
const BANNED = [
  'Kemp Technology Group',
  'Boopify',
  'portal.getproedge.org',
  'progressiveedgellc.com',
  'Go Pro Edge',
  'Get Pro Edge',
  'GET PRO',
  'a Progressive Edge company',
  'H&R Block',
  'H&amp;R Block',
  'Block Advisors',
];

// Each form, the rules it must match, and the named controls it may have that no rule covers.
const FORMS = [
  { page: 'contact.html', marker: 'data-contact-form', rules: CONTACT_RULES, extra: ['website'] },
  {
    page: 'support.html',
    marker: 'data-support-form',
    rules: SUPPORT_RULES,
    extra: ['website', 'attachments'],
    files: 'attachments',
  },
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
  for (const key of turnstileSiteKeys(html)) {
    for (const problem of siteKeyProblems(key)) problems.push(`${page}: ${problem}`);
  }
}

for (const form of FORMS) {
  const file = join(DIST, form.page);
  if (!existsSync(file)) {
    if (pages.length > 0) problems.push(`${form.page}: page is missing`);
    continue;
  }
  const inner = findForm(readFileSync(file, 'utf8'), form.marker);
  if (inner === null) {
    problems.push(`${form.page}: no form with ${form.marker}`);
    continue;
  }
  const controls = formControls(inner);
  const found = contractProblems(controls, form.rules, form.extra);
  if (form.files) found.push(...fileInputProblems(controls, form.files, ALLOWED_EXTENSIONS));
  if (turnstileSiteKeys(inner).length === 0) found.push('no Turnstile widget in the form');
  problems.push(...found.map((problem) => `${form.page}: ${problem}`));
}

if (problems.length > 0) {
  console.error(`check-dist found ${problems.length} problem(s):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`check-dist: ${pages.length} page(s) OK`);
