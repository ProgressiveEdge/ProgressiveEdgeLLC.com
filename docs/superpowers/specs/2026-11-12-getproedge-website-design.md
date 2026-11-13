# Get Pro Edge Website — Design Spec

**Date:** 2026-11-12
**Status:** Approved by owner 2026-11-12
**Repo:** `ProgressiveEdge/ProgressiveEdgeLLC.com` (local `D:\-- Progressive Edge LLC\pe-website`), branch `feature/getproedge-site`

## 1. Goal

Rebuild the public website as **Get Pro Edge, a Progressive Edge company**, at **getproedge.org**. The site's job is lead generation: every page should make it easy to book a call, send a message, phone, or email. It also hosts the customer support request form at `getproedge.org/support`.

The current site (one homepage plus `support/request.html`, static HTML on Cloudflare Pages) is replaced. Its visual design ("Approach 1", dark-first) is kept and extended.

## 2. Identity and what the site may say

| Item | Value |
|---|---|
| Brand (assumed name) | Get Pro Edge |
| Endorsement line | a Progressive Edge company |
| Legal name | Progressive Edge LLC, a Michigan limited liability company |
| Location shown | Auburn, Michigan (city and state only) |
| Phone | (989) 200-4814 → `tel:+19892004814` |
| Email | info@getproedge.org |
| Reply promise | "We reply within one business day." |
| Tagline | ai / technology / people |

**Co-founders** (both shown as "Co-founder"). Bios approved 2026-11-12; use them verbatim. The full bio appears on About and the summary on the Home founder cards.

**David Kemp** — Director of Technology Implementation

> *Bio:* David has spent more than a decade keeping enterprise technology working where it matters most: in the field, in front of the people who depend on it. He grew from field systems technician to lead technician, building a reputation for finding the root cause instead of patching the symptom. He then moved into technology implementation, where he prototyped new tools, built workflow automations and AI-assisted solutions, and guided them from pilot to rollout. Most recently he has managed operations and systems projects. David's prior experience with small organizations taught him how they really run and how technology impacts them. At Get Pro Edge, David leads how solutions are designed, built and delivered, pairing hands-on technical depth with plain-English communication and genuine care for the customer.
>
> *Summary:* More than a decade in enterprise IT support, field operations and technology implementation, from on-site troubleshooting to AI-assisted solutions.

**Stacey Grant** — Director of Operations

> *Bio:* Stacey brings more than twenty years of operations, project management and people leadership, including fifteen years in field operations for a national organization. She has run planning and readiness for three districts and more than 80 locations, kept relocation and construction projects on schedule, and taken new technology from pilot to adoption across more than 100 offices. Her projects have merged separate platforms into one dashboard that saved roughly $100,000 a year, and introduced an AI-powered analysis tool that cut a 60-minute review to five minutes. She has hired, coached and developed teams of up to 20 people, with engagement scores well above company benchmarks. Earlier roles in recruiting, HR consulting and executive support in banking and telecommunications grounded her in compliance, reporting and service. At Get Pro Edge, Stacey makes sure every project is scoped clearly, every client knows what happens next, and the work is delivered on time.
>
> *Summary:* More than twenty years leading operations, projects and teams, including technology rollouts to more than 100 locations.

Bios never name past employers or schools.

**Never published:** ownership split, capital contributions, home addresses, mediator list, buyout or other operating-agreement terms, or the names "Kemp Technology Group" and "Boopify Creative" (Schedule B personal property, not licensed to the company). No invented statistics, client names, logos, or testimonials.

## 3. Site map

| URL | Page |
|---|---|
| `/` | Home |
| `/services` | Services overview |
| `/services/managed-it` | Managed IT Support |
| `/services/ai-automation` | AI & Automation |
| `/services/consulting` | Technology Consulting |
| `/services/websites` | Websites & Digital Products |
| `/about` | About |
| `/contact` | Contact |
| `/support` | Support request form |
| `/privacy` | Privacy Policy |
| `/404` | Not found |

URLs have no trailing slash and no `.html` (Astro `build.format: 'file'`, `trailingSlash: 'never'`). `/support/request.html` 301-redirects to `/support`.

**Navigation:** wordmark (links home) · Services · About · Contact · Support · **Book a Call** (copper button). Below 768px the links collapse behind a menu button that opens a full-width panel; the panel is keyboard-operable, closes on Escape or link click, and returns focus to the menu button when closed.

**Footer:** wordmark + "a Progressive Edge company"; page links (Services, About, Contact, Support, Privacy); phone and email as tap-to-call / tap-to-email; "© {year} Progressive Edge LLC · Auburn, Michigan".

## 4. Page content

Copy below is the intended substance; final wording is drafted during build and reviewed by the owners. Claims stay general and true.

### Home
1. **Hero** — eyebrow "ai / technology / people"; H1 "Technology That Works For *People.*"; subhead naming all four services ("Managed IT, AI and automation, technology consulting, and websites — from one team you can actually reach."); buttons **Book a Call** and **Our Services**.
2. **Services** — four numbered cards (01–04), each with title, two-line summary, "Learn more →" to its page.
3. **How it works** — three steps: **Talk** (book a free call, tell us what's going on) → **Plan** (a clear recommendation and quote) → **Support** (we put it in place and stay with you).
4. **Meet the founders** — two compact cards (photo, name, title, summary) linking to About.
5. **Closing call to action** — "Ready to find your edge?" with **Book a Free Consultation** and the phone number.

### Service pages (one shared template, four data entries)
Sections: page header with service name and one-line promise → What's included → Who it's for → How an engagement works (the three steps, tailored) → 3–4 common questions (native `<details>` elements) → call to action.

| Service | Promise | Included (draft) | Who it's for (draft) |
|---|---|---|---|
| Managed IT Support | Your IT, handled. | Help desk by phone, email and support form; remote support; Microsoft 365 administration (email, Teams, accounts, licenses); computers, printers, network and Wi-Fi; new-employee setup and offboarding; security basics (updates, multi-factor sign-in) | Businesses without in-house IT, or whose IT person needs backup |
| AI & Automation | Put AI to work on the busywork. | AI receptionist and phone agents that answer, route and take messages; workflow automation between the apps you already use; AI adoption (choosing tools, staff training, usage policies); custom assistants grounded in your business information | Teams buried in repetitive admin, missed calls or manual data entry |
| Technology Consulting | Senior technology thinking, without a full-time hire. | Technology assessment and roadmap; modernization (cloud and Microsoft 365 moves, retiring old systems); vendor and software selection; fractional technology leadership | Growing organizations facing big technology decisions |
| Websites & Digital Products | A web presence that brings in work. | Website design and build; hosting, domains and business email setup; ongoing updates; digital products such as online tools, portals and forms | Businesses with an outdated website or none |

Service content lives in one data file so wording changes don't touch templates.

### Services overview
Page header, the four service cards (larger, with "included" highlights), and the closing call to action.

### About
1. Page header — why the company exists (drafted from what the owners provide; until then, a short statement that Progressive Edge was started by David Kemp and Stacey Grant to give businesses of every size dependable, senior-level technology help from people they know by name).
2. Co-founder profiles — 3:4 photo in a corner-bracket frame (echoes the P/e mark), name, "Co-founder · {title}", full bio.
3. Values — Honesty Over Comfort; Outcomes Over Outputs; Simplicity as a Feature; Partnership, Not Vendor (copy carried from the earlier About draft).
4. Company facts — "Get Pro Edge is a Progressive Edge company. Progressive Edge LLC is a Michigan limited liability company based in Auburn, Michigan."
5. Closing call to action.

### Contact
1. Page header with the reply promise.
2. **Book a call** — primary card linking to the Microsoft Bookings page (opens in a new tab).
3. **Send a message** — contact form (Section 7).
4. **Call or email** — phone and email cards.

### Support
The existing request form (fields, priority cards, attachments, remote-support consent) moved into the shared layout, restyled with shared components, with these changes:
- Submits to `/api/support` (Section 7); confirmation shows the Zammad ticket number.
- Turnstile widget and honeypot added.
- Attachments: up to 5 files, 10 MB each, **20 MB total**.
- On failure, the error banner includes the phone number and email.
- Header note: "For anything urgent, call (989) 200-4814."

### Privacy Policy
Plain-language policy covering: what the forms and booking collect; why (to respond and deliver service); where it is processed (Cloudflare for site delivery, Turnstile and cookieless Web Analytics; our helpdesk and Microsoft 365; Microsoft Bookings); that data is not sold; retention; how to request access or deletion (info@getproedge.org); effective date. Flagged to the owners as not legal advice.

### 404
Short message, links to Home, Services and Contact.

## 5. Visual design

**Tokens** (unchanged brand palette):

| Token | Hex | Use |
|---|---|---|
| ink / ink-2 / ink-3 | #0F1420 / #162035 / #1D2B45 | backgrounds, section and card fills |
| slate | #334155 | muted UI |
| silver / silver-light | #848D9B / #C3CAD4 | secondary and body-muted text |
| ice / ice-light | #2F8FA8 / #9AE8F7 | accent lines, labels, links |
| paper | #F6F8FB | primary text |
| copper / copper-light | #C0623A / #F0A27A | accents, hover |
| **copper-button** | **#AD5634** | copper button background only (white text reaches 4.7:1) |

**Type:** Michroma (wordmark, numerals), Jura (headings), Quantico (body), loaded from Google Fonts with `display=swap` and preconnect.

**Wordmark:** text, not an image — "GET PRO" in paper (uppercase), "/" in ice-light, "edge" in silver-light (lowercase), Michroma. Endorsement line beneath it in the footer and on About.

**Components:** sticky nav with ice bottom border and glow; page header with ice glow; section label + title; numbered service card with copper left edge on hover; step list; founder card with corner-bracket photo frame; FAQ accordion; contact method card; call-to-action band; form fields, priority cards and file drop (from the support form).

**Motion:** sections fade and rise 12px into view once (IntersectionObserver); cards lift on hover; hero scroll indicator animates. All motion is disabled under `prefers-reduced-motion: reduce`. With JavaScript off, all content is visible.

**Responsive:** mobile-first; breakpoints 560 / 768 / 1024px; 16px minimum side gutter on phones; no horizontal scroll at 320px.

**Accessibility target:** WCAG 2.1 AA — contrast, visible focus rings, skip-to-content link, semantic landmarks, labelled form fields with errors announced, 44px minimum touch targets.

**Icons and sharing:** favicons and app icons from `Brand Guidelines/icons` (P/e mark); one 1200×630 `og-image.png` (ink background, P/e mark, wordmark, tagline) rendered from an HTML template with headless Edge.

**Photos:** the supplied headshots are stored as originals in `src/assets/team/` and served through Astro's image pipeline (resized, WebP, explicit dimensions, lazy-loaded except above the fold).

## 6. Architecture

Astro (current stable), static output, deployed on the existing Cloudflare **Worker** `progressiveedgellc-com` (Workers Builds) with static assets from `dist/`. `worker/index.ts` routes `/api/contact` and `/api/support` to the form pipeline in `functions/_lib/`; every other request is served from the assets. (Changed 2026-11-12: the owner's project turned out to be a Worker, not a Pages project, and the owner chose to keep it.)

```
pe-website/
  astro.config.mjs          site: https://getproedge.org, sitemap integration
  package.json, .nvmrc      Node 24 for Cloudflare builds (Astro 7 needs ≥ 22.23)
  src/
    config/site.ts          name, endorsement, legal name, phone, email, booking URL,
                            reply promise, location, Turnstile site key
    data/services.ts        the four services (slug, title, promise, summary,
                            included[], whoFor[], steps[], faqs[])
    data/team.ts            co-founders (name, title, bio, summary, photo)
    data/values.ts          the four values (About page)
    lib/paths.ts            cleans Astro.url.pathname (build output ends in .html)
    styles/site.css         tokens + base + shared component styles
    layouts/Base.astro      <head> meta/OG/JSON-LD, skip link, Nav, Footer, reveal script
    components/             Nav, Footer, Wordmark, BookingLink, PageHeader, SectionHeading,
                            ServiceCard, Steps, FounderCard, Faq, ContactMethods, CtaBand
    pages/                  index, about, contact, support, privacy, 404,
                            services/index, services/[slug]
    scripts/                nav.ts, reveal.ts, forms.ts, contact-form.ts, support-form.ts
    assets/team/            david.webp, stacey.webp (originals)
  public/                   icons/, og-image.png, robots.txt, _redirects
  wrangler.jsonc            Worker config: name, static assets (dist/, 404 page), webhook URL vars
  worker/index.ts           Worker entry: /api/contact, /api/support → handle.ts; else static assets
  functions/
    _lib/                   validate.ts (shared with the browser), turnstile.ts,
                            forward.ts, handle.ts (request pipeline)
  tests/                    Vitest unit tests
  scripts/                  check-dist.mjs (links, URL style, banned strings), og/ (og-image template)
  n8n/                      contact-to-zammad.json, support-to-zammad.json (importable)
  docs/setup.md             owner setup steps (Section 9)
```

**Rules:** every page uses `Base.astro`; contact details come only from `site.ts`; service and team copy come only from the data files. If `bookingUrl` is empty, every Book a Call button points to `/contact` instead.

The old `index.html`, `support/request.html` and `CNAME` are removed from the repo root once their content is ported.

## 7. Forms and integrations

### Flow
Browser → `POST /api/contact` or `/api/support` (Worker) → n8n webhook (public path; n8n UI stays behind the Entra gate) → Zammad REST API on the server's internal network → response back to the browser. The Entra gate on `support.getproedge.org` is not changed. `portal.getproedge.org` is not used (reserved for a future payment portal).

### Form endpoint behaviour (both endpoints)
1. Reject non-POST (405) and bodies over 25 MB (413).
2. Honeypot field `website` non-empty → respond `200 {ok:true}` and drop silently.
3. A required secret or webhook URL is missing → `500 {error:"config"}`.
4. Verify Turnstile token with `challenges.cloudflare.com/turnstile/v0/siteverify` (secret + client IP); failure → `400 {error:"verification"}`.
5. Validate fields (below); failure → `400 {error:"validation", fields:[...]}`.
6. Forward to the n8n webhook URL as `multipart/form-data` with header `X-PE-Webhook-Secret`, 20-second timeout. Text fields keep their names; files are sent as `attachment_1` … `attachment_5` with their original filename and type. (Multipart, not JSON with base64: n8n's default JSON body limit is 16 MB, which a 20 MB attachment set would exceed once base64-encoded, and multipart keeps base64 work out of the Worker's CPU budget. n8n base64-encodes the files for Zammad.)
7. n8n success → `200 {ok:true}` (contact) or `200 {ok:true, ticketNumber}` (support). Timeout or non-2xx → `502 {error:"upstream"}`.
8. Never log message bodies or attachments.

### Fields
**Contact:** name (required, ≤200), email (required, valid, ≤254), company (≤200), phone (≤50), service (one of the four or "Not sure yet"), message (required, ≤5000).

**Support:** as the current form — name, company, email, phone, preferred contact method, category, priority, subject (≤500), description (≤8000), when it began, who is affected, what was tried (≤8000), best time to contact, remote-support consent, attachments (≤5 files, ≤10 MB each, ≤20 MB total; png, jpg, jpeg, gif, webp, pdf, txt, doc, docx, xls, xlsx — checked server-side by extension and size).

### n8n workflows (shipped as importable JSON)
Each: Webhook node (POST, Header Auth credential matching the shared secret, respond via "Respond to Webhook") → Code node to shape the Zammad payload → HTTP Request to Zammad `POST /api/v1/tickets` with an API token → Respond to Webhook.

- **Contact → Sales group.** Title "Website lead: {name} — {service}"; customer `guess:{email}`; article type `web`, body with all fields.
- **Support → Support group.** Title = subject; customer `guess:{email}`; priority mapped Critical/High → "3 high", Normal → "2 normal", Low → "1 low", plus tag `critical` for Critical; article body with all fields; attachments passed through. Returns `{ticketNumber}` from Zammad's `number`.

The Zammad base URL used inside n8n is the internal Docker address from `pe-infrastructure`, confirmed during build.

### Browser behaviour
Submit button disables while sending. Success: contact form is replaced by a thank-you message with the reply promise; support form shows the ticket number. Failure: error banner with phone and email; entered data is kept. Client-side validation mirrors the server's.

### Secrets and settings
Worker secrets (dashboard, encrypted): `TURNSTILE_SECRET_KEY`, `N8N_WEBHOOK_SECRET`. The webhook URLs `N8N_CONTACT_WEBHOOK_URL` and `N8N_SUPPORT_WEBHOOK_URL` are not secret and live in `wrangler.jsonc` `vars`. Turnstile site key is public and lives in `site.ts`.

## 8. Search and metadata

Per page: unique `<title>` and meta description, canonical URL on `https://getproedge.org`, Open Graph and Twitter card tags using `og-image.png`. Site-wide: `sitemap-index.xml`, `robots.txt` pointing to it, JSON-LD `ProfessionalService` (name Get Pro Edge, legalName Progressive Edge LLC, url, logo, telephone, email, address locality Auburn, region MI, country US). Cloudflare Web Analytics (cookieless) enabled in the dashboard with automatic setup — no script in the repo.

## 9. Deployment

1. Build on `feature/getproedge-site`. Before its first push, the owner sets the Worker's build command to `npm run build` (deploy command stays `npx wrangler deploy`), adds the build variable `NODE_VERSION=24`, adds the two Worker secrets, and makes sure workers.dev preview URLs are on. From then until the merge, a push to `main` fails to build and production keeps serving the last good deployment, so the current site stays up.
2. Push the branch → Workers Builds uploads a preview version at a `*.workers.dev` preview address. All testing (Section 10) happens there.
3. Owner setup, documented step by step in `docs/setup.md`:
   - Microsoft Bookings page created; URL put in `site.ts`.
   - Turnstile widget created for `getproedge.org` and the account's `workers.dev` subdomain (preview host); keys added.
   - Zammad: **Sales** group created; API token with `ticket.agent` on Sales and Support groups.
   - n8n: both workflows imported; Header Auth and Zammad credentials set; workflows activated.
   - `info@getproedge.org` exists as a mailbox or alias in Microsoft 365 (domain mail already routes to Microsoft 365).
4. Merge to `main` → production deploy.
5. Domains: add `getproedge.org` and `www.getproedge.org` as Worker custom domains; Cloudflare Redirect Rule in the getproedge.org zone sends `www` → apex (301, path and query kept).
6. Redirect Rule in the progressiveedgellc.com zone: hostname equals `progressiveedgellc.com` or `www.progressiveedgellc.com` → `https://getproedge.org` + same path (301, query kept). The existing proxied record stays so the rule can fire. Other progressiveedgellc.com hostnames (voice, mesh, mail) are not matched.
7. Rollback: Worker → Deployments → previous version → Rollback.

Commits use the repo-local Progressive Edge identity.

## 10. Testing

- **Unit (Vitest, in `tests/`):** `functions/_lib` — field validation (each rule, limits, enum), honeypot, Turnstile failure, attachment limits, upstream timeout and non-2xx mapping, success shapes; the n8n Code-node scripts (ticket shape, priority mapping, attachments); data-file integrity. Written test-first.
- **Build:** `astro check` and `npm run build` with no errors or warnings.
- **Links:** script crawls `dist/` and fails on any internal link to a missing page or asset.
- **Browser (preview deploy):** every page at 375, 768 and 1280px — layout, menu open/close by mouse and keyboard, reveal animations, reduced-motion, tap-to-call/email links.
- **Accessibility:** axe-core on every page with zero serious or critical issues; keyboard-only pass through nav and both forms.
- **End to end:** one contact submission lands as a Sales ticket and one support submission (with an attachment) lands as a Support ticket with the number shown on screen; then the test tickets are deleted.
- **Redirects (after go-live):** `/support/request.html`, `www.getproedge.org`, `progressiveedgellc.com/about`, and `www.progressiveedgellc.com` all land on the right getproedge.org page; `voice`/`mesh` hostnames still answer as before.

## 11. Open items (not blocking the build)

1. **Assumed name mismatch:** the draft operating agreement's Schedule C says "Go Pro Edge". The name filed with Michigan LARA must match "Get Pro Edge" before launch.
2. Stacey confirms she is comfortable publishing the figures in her bio (100+ offices, ~$100,000 savings, 60→5 minute review); both owners review the rest of the drafted copy.
3. Microsoft Bookings URL and Turnstile keys (site falls back to `/contact` for booking until set).
4. "Free consultation" is carried over from the current site — confirm it stays free.
5. Service-area statement — omitted unless the owners want one (e.g. "remote support anywhere in the U.S.").

## 12. Out of scope

Insights/blog, case studies, testimonials, the stats row, the customer payment portal (`portal.getproedge.org`), Zammad customer self-service login, and any change to the Entra sign-in gate.
