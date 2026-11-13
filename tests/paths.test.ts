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
