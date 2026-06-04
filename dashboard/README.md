# All Volleyball — Marketing Operations Dashboard

Internal tool for the marketing and leadership team (Richard, Corey, Andrew, Brett, Kelsey).
Tracks the quarter's Rocks, the email and content pipeline, the marketing budget, the
automation stack, and active vs ended promotions. Not customer facing.

> Volleyball only. That is the whole business.

## Run

It is static. Zero build step, zero dependencies, zero env vars required.

- Open `dashboard/index.html` directly, or
- Serve the folder: `python -m http.server` then visit `/dashboard/`, or
- It is live wherever this repo publishes (GitHub Pages / Vercel) at `/dashboard/`.

Every view renders on seed data on first load. Nothing blocks on a missing API.

## Views

`/ OVERVIEW` quarter at a glance, focus strip, June plan callout, live promo, alerts, live discipline scanner.
`/ ROCKS` the full Q2 Rocks tree, collapsible, rollup % per Rock and subgroup, owners.
`/ JUNE` the June social and email plan: ordering-window spine, three parallel tracks,
   send-volume and social-pillar charts, cadence grid, a full June calendar, the Teams /
   Retail / CustomFuze email tables (tabbed, scan badge per subject), email and social
   post mockups, stories, and guardrails with the live source-flag scan.
`/ CAMPAIGNS` Teams 10-email A/B arc and Retail track, scan badge per subject, Klaviyo KPIs.
`/ PROMOS` active June 1 test (full matrix) and the ended VIP75 clearance, archived.
`/ BUDGET` P&L by channel and category, target mix vs actual, Test carve-out tracker.
`/ AUTOMATION` n8n health: live UA parser, vendor roadmap, idea backlog.
`/ CONTENT` team-side buildout, UGC partnership, spotlight series, locked voice phrases.

## Files

```
dashboard/
  index.html      shell: top rail + nav + main mount
  styles.css      brand tokens + the entire theme (no stray hex in markup)
  data.js         typed seed data: rocks, campaigns, promos, budget, automation, partnerships
  june.js         June social + email plan: tracks, email/social calendar, day map, mockup source
  scanner.js      discipline scanner (window.Discipline.scanCopy) with locked-phrase exemption
  connectors.js   Asana / Klaviyo / n8n contracts with seed fallback
  README.md
  .env.example    env contract
```

## Brand system

Tokens live in `styles.css` `:root`. Red `#c8102e`, ink `#1a1a1a`, cream surfaces.
Type: Helvetica Neue (display + body), Times New Roman italic red for short accents,
SF Mono for the `/ LABEL` eyebrow tags. No gradients, no heavy shadows, no rounded pills.

## Discipline scanner

`window.Discipline.scanCopy(text)` returns `{ clean, violations }`. It flags em dashes,
banned words, hard year references (2000-2099), and 24-hour / same-day quote promises.
A `<ScanBadge>`-equivalent renders on every customer-facing string: campaign subject
lines, the PDP promo copy add, and the locked voice phrases. The Overview has a live
scanner box you can type into.

## Connectors

Each connector is gated on an env var and falls back to seed cleanly.

- `ASANA_TOKEN` — live Rocks from project GID `1215155436119479`. Sections map to Rocks,
  task completion to leaf status. (Section names use prefix grouping; the API cannot create sections.)
- `KLAVIYO_API_KEY` — campaign metrics for the Campaigns view.
- `N8N_API_KEY` — workflow run status. Base `https://richardbiticon.app.n8n.cloud`.
- Meta / Google / Attentive — typed stubs with `// TODO`, seed data stands in.

Static hosting has no server, so live pulls need a small serverless route or proxy that
holds the tokens and returns the shapes documented in `connectors.js`. Never put a token
in client code. See `.env.example`.

## Swapping placeholder budget figures for real pulls

`data.js` `budget.channels[]` figures are marked `// PLACEHOLDER`. Replace each `monthly`
value with the real pull (Meta, Google, Klaviyo, Attentive, partnerships, tools, labor),
keep the `category` (`Retail | Team | Shared`) and `source` fields, and the stacked bar,
category tiles, target-mix, and Test carve-out tracker all recompute automatically.

## Guardrails

Internal tool. No public auth, no customer PII. Placeholder numbers are labeled.
Keep copy scan-clean: no em dashes, no banned words, no hard years, no same-day quote promises.
