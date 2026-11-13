# Get Pro Edge website — owner setup

Do these once, in order. Steps 1–6 come before launch; step 7 comes after the branch is merged. After finishing step 1, retry the branch's build in Cloudflare so it uses the new settings.

The site runs on the existing Cloudflare **Worker** `progressiveedgellc-com` (Workers & Pages). `wrangler.jsonc` in the repo tells it to serve the built site from `dist/` and to run `worker/index.ts` for the two form endpoints.

## 1. Worker build settings and secrets

Cloudflare dashboard → Workers & Pages → `progressiveedgellc-com` → Settings.

**Builds** (Settings → Builds → Build configuration):
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (leave as is)
- Production branch: `main`. Never set it to another branch: the production branch goes live.
- Preview command (**Previews Base** tab, next to **Production** at the top of Builds): leave Cloudflare's default, `npx wrangler preview`. `npx wrangler versions upload` also works. `wrangler.jsonc` has the `previews` settings that `wrangler preview` needs, and its `build.command` makes Wrangler build the site itself, so branch builds work even if the Previews Base tab has no build command.
- Root directory: leave as the repository root
- Node version: nothing to set. The build reads `.nvmrc` (Node 24).

**Preview URLs** (Settings → Domains & Routes): make sure **workers.dev** and **Preview URLs** are enabled, so a push to `feature/getproedge-site` gets its own test address. The branch's build log prints that address.

Save, then retry the `feature/getproedge-site` build and wait for it to succeed.

**Secrets.** The dashboard's Variables and Secrets page won't accept secrets yet. The live Worker is still the old static-only site, and the page says "Variables cannot be added to a Worker that only has static assets." Add the secrets from your computer with Wrangler instead, **once a version with code exists** (after a successful branch build, or after `npx wrangler versions upload` from the `pe-website` folder). Secrets added while the Worker has no code are dropped:

1. Open PowerShell (not Git Bash) in the `pe-website` folder and run `npx wrangler login`. A browser window asks you to allow access to your Cloudflare account.
2. Make the webhook secret. In Git Bash, `openssl rand -hex 32 | clip` copies a random value to the clipboard without showing it. Save it in your password manager, because step 5 needs it.
3. Back in PowerShell, run `npx wrangler versions secret put N8N_WEBHOOK_SECRET` and paste the value at the hidden prompt.
4. After step 2: run `npx wrangler versions secret put TURNSTILE_SECRET_KEY` and paste the Turnstile secret key.

Each command saves a new version of the Worker that includes the secret. Neither changes the live site. Later version uploads, and the deploy after the merge, carry the secrets forward. Previews made by `wrangler preview` keep their own secrets. To test the forms on one, run `npx wrangler preview base-config secret put N8N_WEBHOOK_SECRET` and the same for `TURNSTILE_SECRET_KEY`, and add the Preview's hostname to the Turnstile widget. After the merge, Settings → Variables and Secrets should list both secrets. If one is missing, add it there as type **Secret**; the page accepts secrets once the Worker has code.

The two n8n webhook URLs are not secret and already live in `wrangler.jsonc`; don't add them as secrets. Every deploy replaces the Worker's plain-text variables with the ones in `wrangler.jsonc`; secrets are kept.

Once the build command is set, a push to `main` fails to build until this branch is merged, because the old `main` has no `package.json`. Production keeps serving the current site.

## 2. Cloudflare Turnstile

Cloudflare dashboard → Turnstile → Add widget.
- Name: `getproedge.org forms`
- Hostnames: `getproedge.org` and your account's `workers.dev` subdomain (for example `yourname.workers.dev`, shown on the Workers & Pages overview). Preview addresses are subdomains of it.
- Widget mode: Managed

Copy the keys:
- **Site key** → `src/config/site.ts` → `turnstileSiteKey` (replace the test key `1x00000000000000000000AA`), then commit.
- **Secret key** → the Worker secret `TURNSTILE_SECRET_KEY` (step 1).

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

The production webhook URLs must match `wrangler.jsonc`: `/webhook/website-contact` and `/webhook/website-support`.

## 6. Mailbox

Create `info@getproedge.org` in the Microsoft 365 admin center, as a mailbox, shared mailbox or alias. Mail for getproedge.org already routes to Microsoft 365.

## 7. Go live (after the branch is merged to `main`)

1. Worker → Settings → **Domains & Routes** → Add → **Custom domain**: `getproedge.org`, then again for `www.getproedge.org`. If Cloudflare says a DNS record already exists for one of these names, check what it is before replacing it, and never touch the `n8n`, `support`, `mesh`, `vault`, `auth` or voice records.
2. **getproedge.org** zone → Rules → Redirect Rules → Create:
   - Name: `www to apex`
   - When: Hostname equals `www.getproedge.org`
   - Then: Dynamic redirect to `concat("https://getproedge.org", http.request.uri.path)`, status **301**, preserve query string.
3. **progressiveedgellc.com** zone → Rules → Redirect Rules → Create:
   - Name: `old site to getproedge.org`
   - When: (Hostname equals `progressiveedgellc.com`) **or** (Hostname equals `www.progressiveedgellc.com`)
   - Then: Dynamic redirect to `concat("https://getproedge.org", http.request.uri.path)`, status **301**, preserve query string.

   Keep the Worker's existing custom domains (or proxied, orange-cloud DNS records) for those two names in place, so the rule can fire. Don't match any other progressiveedgellc.com hostname, such as voice, mesh or mail.
4. Cloudflare dashboard → Analytics & Logs → **Web Analytics** → Add a site → `getproedge.org` → automatic setup. It is cookieless.
5. If the launch date isn't November 12, 2026, update `effective` in `src/pages/privacy.astro`.

## Rollback

Worker → **Deployments** → the previous version → **Rollback**.

## Known limits and open items

- Cloudflare's free Workers plan allows 10 ms of CPU per request. Reading a support request with large attachments may go over that, and the form then shows its error banner. If it happens, turn on **Workers Paid** ($5/month) in the Cloudflare account, which raises the limit.
- The privacy policy is a plain-language draft, not legal advice.
- The assumed name filed with Michigan must read "Get Pro Edge" before launch. Schedule C of the draft operating agreement says "Go Pro Edge".
- Stacey should confirm she is comfortable publishing the figures in her bio, and both owners should review the drafted service copy.
- "Free consultation" wording is carried over from the old site. Confirm it stays free.
