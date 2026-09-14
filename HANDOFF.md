# Capacity Dashboard — Handoff (September 2026)

Paste this into a new Claude session to continue the work. Repo: `/Users/jivererazo/Documents/Capacity/brandsharkscapacity` (git, `main` → `github.com/jiver-brandsharks/brandsharkscapacity`). Hosting: Cloudflare Pages at `brandsharkscapacity.pages.dev` behind Cloudflare Access (one-time-PIN email login). Direct-upload deploy so far; the copilot function needs a Git or Wrangler deploy.

Standing rule from the owner (Jiver, PPM at Brand Sharks): **every requested change to `index.html` is committed and pushed straight to `main`**, no branches, no PRs. Verify in a browser first, never force-push. All UI copy is **English, Title Case for titles/labels**, Spanish is fine for conversation.

## What it is

A capacity-planning tool for Brand Sharks (short-form video agency). It answers one question before a sales call: **can we take another client, and if not, which role do we hire and by when.** It is an EOS rock due Nov 19, 2026. Definition of done: the founder (Danny) opens one page, gets yes / tight / no plus the role to hire, and the model would have flagged the last creative-director hire at least six weeks early (July backtest, still pending).

## Files

- `index.html` — the whole app: CSS, markup, `DATA` object (sample data), all logic. Chart.js 4.4.1 from cdnjs, Montserrat from Google Fonts (fallback only), `@font-face` for Proxima Nova pointing at `fonts/ProximaNova-Regular.woff2` / `-Bold.woff2` (files not in repo; drop them in and the brand font loads). No build step.
- `functions/api/ask.js` — Cloudflare Pages Function. Proxies the copilot chat to the Claude API (`claude-opus-5`, streaming SSE, `fallbacks: "default"` with beta `server-side-fallback-2026-07-01`, `output_config.effort: "medium"`). Needs `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`) as a Pages environment variable. The dashboard state is sent as the `context` and injected into the system prompt.
- `README.md` — deploy and env-var notes. `wrangler.toml` — placeholder.
- Outside the repo: `Documents/Capacity/master-capacity-sheet.xlsx` (manual data source; has a `Hiring Lead Time` tab), `capacity-handoff.md` (original brief), `Capacity-Team-Guide.pdf` (team presentation, 14 slides; owner said no more PDFs).

## Model (all in `index.html`)

- **Points, not videos.** Tier A video = 2 points, B = 1, C = 0.5. Editing and Social Media are measured in points/week; Creative Director in scripts/week; PPM (production project management, every video passes PM review) in reviews/week.
- **Weekly buckets, 90-day horizon** (`HORIZON = 12` weeks; `DATA.weeks` has 12 entries with per-department demand and fly-out batches that add editing points, CD scripts and PM reviews in the week they land).
- **Trigger:** saturation week (first week demand > capacity) minus lead time (`DATA.leadTime[key]` = sourcing + hiring + ramp, all rows `confirmed:false`) = week to open the search. Negative → "Open now, N weeks late".
- **Client types:** `Flyout` (labelled Fly-out: batch shot on location), `Virtual` (labelled **Self-Record**: we send the script, the client films — hardest to keep out of the red zone), `Clipping`. Every client has tier, cadence, volume, CD/editor/backup/SMM, 8-week runway array, first-time approval %, committed/delivered this month, renewal date, platforms.
- **Status bands:** green < 85%, yellow 85–100%, red > 100%; runway 14+/7–13/<7 days; approval target 80%.
- **Client status:** Critical (no editor or runway < 7), At Risk (missing CD/SMM except clipping, runway < 14, approval < 65, behind delivery pace), else Healthy. Missing backup alone is tracked under Single Points of Failure.
- **Per-client weekly load** = editor's assigned points × client's share of that editor's monthly points (keeps drawer, roster and rebalancing consistent).
- **Rebalancing:** greedy; moves recurring clients from editors ≥ 85% to editors at the same tier or higher that stay ≤ 85%.
- **Simulator:** new client by type + cadence preset + start week; every new client assumed tier A (`DATA.sim.tier`); per-type factors for CD/SMM/PPM load.

## Views

Overview (4 KPIs, Capacity Utilization with a Gauges / Bars / Runway to Saturation / 90-Day Heatmap dropdown, verdict + next action, Editor Workload, Demand Mix) · Forecast (department tiles, simulator, stats incl. Gap at Peak in hires, stacked weekly chart, All Departments next/past 90 days) · Hiring (triggers table, lead-time table, hiring windows timeline) · Fly-outs (calendar, upcoming batches) · Clients (portfolio with sort, group-by, filters, CSV; Signals card with Runway / Delivery / Approval / Renewals tabs) · Team (roster, rebalancing moves, single points of failure, format coverage).

Everything is a link: KPIs, gauges, names and dates open drawers (client, editor, department, owner). Command palette ⌘K or `/` (only shortcut kept; Esc closes). Presentation mode and copilot are reachable from the palette; copilot also via the floating **Ask Copilot** button. Deep links: `#forecast`, `?client=Name`, `?editor=Name`, `?fn=cd`, `?owner=cd:Name`, `?copilot=1`, `?present=1`.

## Design rules the owner cares about

Black background, brand blue `#3CB8FA`, three status colours only (`#2FBF55`, `#FFD60A`, `#D92D27`), Proxima Nova Bold for titles / Regular for text (Montserrat fallback, weights 700/400), thin status line on tiles (no interior glow), minimal copy (tooltips on the "i" instead of subtitles), no native black text (`color-scheme: dark`), no purple anywhere, no PDFs.

## Open items

1. **Google Sheet feed** — replace the `DATA` object with a fetch. Plan: one sheet, one tab per table (`Clients`, `People`, `Flyouts`, `LeadTime`, `Formats`, `Config`, `_Readme`), row 1 headers, Apps Script web app returning JSON; later a Pages Function in front so the sheet stays behind Access. Language of the sheet (English vs Spanish) not decided.
2. **ClickUp → Sheet** Apps Script for pipeline counts and editor assignments (space "Delivery"; statuses Assignments, Needs Assigning, Editing, PM Review, CD Review, Ready to Send, Scheduled).
3. **Confirm lead times with Danny** (observed CD ramp ≈ 11 weeks; sample uses 8 total).
4. **July backtest** for the rock proof.
5. **Copilot go-live**: deploy with `functions/`, set `ANTHROPIC_API_KEY`.
6. Nice-to-haves discussed: revenue per client vs load (needs pricing data), utilization history from sheet snapshots, Spanish presentation.
