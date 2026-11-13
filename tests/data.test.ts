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
    expect(site.name).toBe('Progressive Edge');
    expect(site).not.toHaveProperty('endorsement');
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
