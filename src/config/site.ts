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
