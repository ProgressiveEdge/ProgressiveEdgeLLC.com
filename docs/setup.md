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
| `TURNSTILE_SECRET_KEY` | Secret | from step 2 (add it once step 2 is done) |
| `N8N_CONTACT_WEBHOOK_URL` | Text | `https://n8n.getproedge.org/webhook/website-contact` |
| `N8N_SUPPORT_WEBHOOK_URL` | Text | `https://n8n.getproedge.org/webhook/website-support` |
| `N8N_WEBHOOK_SECRET` | Secret | a long random value — in Git Bash: `openssl rand -hex 32`. Keep it for step 5. |

After this change a push to `main` fails to build until the branch is merged. Production keeps serving the last good deployment, so the current site stays up.

Also check Settings → Runtime (or Functions) → **Compatibility date** is 2021-11-03 or later (any recent date is fine). Older dates make uploaded files arrive as text, and support attachments would be dropped.

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
