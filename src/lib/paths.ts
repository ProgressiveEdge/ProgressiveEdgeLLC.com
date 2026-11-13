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
