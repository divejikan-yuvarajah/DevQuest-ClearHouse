# ClearHouse Premium UI Transformation

## Starting point

- **Starting commit:** `5a6ed58` (`style: polish API docs, health console, metrics, and visual consistency`)
- **Branch:** `ui-final-polish` (fast-forwarded from `master`)

## Design concept

**ClearHouse Financial Command Center** — institutional clearing infrastructure presented as a modern trading / operations console, using the Zatroz brand language.

Visual mix: ~80% graphite/black surfaces, ~15% warm-white/muted type, ~5% orange emphasis. Semantic green / red / amber reserved for financial meaning.

## Zatroz palette

| Token | Value |
| --- | --- |
| Brand | `#FF3B10` |
| Background | `#070707` |
| Sidebar | `#0B0B0C` |
| Surfaces | `#111113` / `#171719` / `#1D1D20` / `#232327` |
| Text | `#F7F5F2` / `#B7B3AE` / `#787570` |
| Positive | `#31D0A3` |
| Negative | `#FF5D68` |
| Warning | `#F4B13F` |
| Danger | `#FF4758` |
| Connecting | `#FF7A4D` |

## Frontend files changed

- `client/styles/dashboard.css` — full dark design-system + shell/views
- `client/index.html` — branding / nav labels / document title
- `client/js/app.js` — page copy (`VIEW_META`) only
- `src/controller/docsController.ts` — branded dark docs chrome (Swagger CSP/URLs unchanged)
- `docs/clearhouse-premium-ui-transformation.md` — this document

## Design tokens

Centralized in `:root` as CSS variables (`--brand`, `--bg`, `--surface-*`, `--text-*`, `--border-*`, semantic colors, radii, shadows, spacing). Existing selectors continue to consume aliases (`--z-orange`, `--surface-1`, etc.).

## Navigation

- Sidebar: ClearHouse mark, **Clearing Infrastructure**
- OPERATIONS: Overview, Markets, Accounts, Activity, Risk & Balances
- PLATFORM: API Docs, System Health, Metrics
- Active: soft orange fill + left brand rail
- Footer: real `#env-status` / connection presentation

## Views

- **Overview** — command-center title, status strip, orange Total Accounts KPI, graphite asset cards
- **Accounts** — participant directory + holdings (tested selectors preserved)
- **Markets** — order book bids/asks with semantic colors; LIVE chip; no fabricated market stats
- **Activity** — recent trades from real feed
- **Risk & Balances** — meters keep existing ok/warning/danger thresholds
- **Operator Access** — same form IDs/wiring; compact dark session chrome
- **API Docs** — dark ClearHouse shell; Swagger method colors untouched
- **System Health / Metrics** — real `/health`, `/ready`, `/api/metrics` only

## Responsive / a11y / motion

- Desktop sidebar + full-width workspace; drawer under ~980px
- Focus-visible rings; reduced-motion disables pulses/transitions
- ARIA / `aria-busy` / captions / tested DOM contracts preserved

## Security

- No new CDNs, frameworks, or unsafe `innerHTML`
- Docs CSP unchanged (unpkg Swagger only)
- Dashboard CSP unchanged (`'self'`)

## Tested selectors preserved

Including: `#balance-view`, `#orderbook-view`, `#risk-view`, `.bids` / `.asks` / `.best` / `.more`, `#connection-status`, `.stale-note`, `#accounts-view [data-account-id]`, `[data-status]`, `[data-asset]`, `[data-summary="accounts"]`, `.asset-total`, `.amount`, `.holders`, `[data-meter]`, `.percent`, `progress`, `[data-trade]`, `[data-notional]`, `time[datetime]`, `aria-busy`, table captions/`th`, no decorative `img`.

## Verification

Recorded after final UI changes:

- typecheck: PASS
- Challenge12: PASS (16)
- Challenge17: PASS (8)
- Challenge19: PASS (10)
- Challenge20: PASS (8)
- Challenge21: PASS (4)
- full `npm test`: PASS — 31/31 files, 279/279 tests
- `git diff --check`: clean

## Remaining visual issues

- Swagger UI core remains light inside the dark docs shell (intentional, to preserve method semantics)
- No automated screenshot matrix across breakpoints
