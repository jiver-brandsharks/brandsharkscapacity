# Brand Sharks · Capacity

Single-file capacity dashboard (`index.html`, Chart.js from CDN, no build step) with an optional AI copilot served by a Cloudflare Pages Function.

## Deploy

The site is a Cloudflare Pages project. Direct upload works for the page alone; the copilot needs the `functions/` directory, which Pages only picks up when deploying from Git or with Wrangler:

```bash
npx wrangler pages deploy . --project-name brandsharkscapacity
```

## Copilot (optional)

`functions/api/ask.js` proxies chat requests to the Claude API so the key never reaches the browser. Cloudflare Access protects `/api/ask` like the rest of the site.

Environment variables on the Pages project (Settings → Environment variables, Production):

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_MODEL` | optional, defaults to `claude-opus-5` |

Without the key the page still works: the copilot shows the rule-based signals and explains that chat is not configured.

## Data

Everything on the page comes from the `DATA` object at the top of the script in `index.html`. It is sample data until the Google Sheet feed is connected.
