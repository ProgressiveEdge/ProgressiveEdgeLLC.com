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
