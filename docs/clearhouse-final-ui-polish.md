# ClearHouse Final UI Polish

## Identity

| Field | Value |
| --- | --- |
| Branch | `ui-final-polish` |
| Starting commit | `996e6e67836cc2420adb95636eb55c9cf9db013d` |
| Official final branch | `master` |
| Files changed | `client/index.html`, `client/styles/dashboard.css`, `docs/clearhouse-final-ui-polish.md` |

No backend, tests, config, package, API, WebSocket, or JS renderer files were modified.

## Design direction

Premium **light paper ledger**: cream field, charcoal type, one clay accent. Same terminal layout (sticky bar, dense grid). Not a dark SaaS shell and not a generic Bootstrap admin.

## Color system

| Token | Value |
| --- | --- |
| Page | `#F3EFE6` |
| Surface | `#FFFCF8` |
| Text | `#1C1915` / `#5F574D` / `#6B645A` |
| Accent | `#C45C26` |
| Positive | `#2F6B4F` |
| Negative | `#B42318` |
| Warning | `#A56A12` |
| Borders | `#E4D9CB` |

## Typography

System sans (`ui-sans-serif`, `system-ui`, Segoe UI). Financial figures: `ui-monospace` + `font-variant-numeric: tabular-nums`. No external fonts (CSP `font-src 'self'`).

## Layout

Sticky 60px command bar (brand + live status). Compact login/market toolbar. Desktop (≥1200px) workspace: KPI strip, order book + trades on the left, accounts/balances/risk on the right. 768–1199px two-column reflow; &lt;768px stacked sections with wrapping forms and table overflow.

## Panels / cards

14px radius, 1px hairline border, modest shadow, hover border only. Section titles from existing `aria-label` via CSS `::before` (does not change `textContent`).

## Accounts / portfolio / risk

Account rows remain `[data-account-id]` articles with status chips and holding pills. Portfolio KPI number is still `[data-summary="accounts"]` (count only in `textContent`). Asset cards use `.asset-total` / `.amount` / `.holders`. Risk meters keep `progress`, `.percent`, and `data-level` ok/warning/danger.

## Order book

Unchanged DOM: `.bids` / `.asks` / `.best` / `.more` as direct `div` rows, text still `"price x quantity"`. Visual BID/ASK labels, emerald/coral best rows. **No depth bars** (avoids Number conversion of financial quantities).

## Trades

`.recent-trades [data-trade]` rows; `[data-notional]` exact integer string preserved; muted `time`.

## Live state

`#connection-status[data-state]` connecting / live / stale / reconnecting / stopped. Dot indicator; pulse only on connecting/reconnecting; `prefers-reduced-motion` disables animation.

## Loading / empty / error

`data-state` and existing copy unchanged. Loading adds a CSS shimmer rail. Empty adds a dashed geometric mark. Error uses a restrained red border/background. `role=alert` / `aria-busy` still set only by `dashboard.js`.

## Accessibility / motion

Focus-visible rings, labels wrapping inputs, contrast on dark surfaces, status not color-only (text + shape). Transitions ~160ms. Reduced-motion cuts animation/transition.

## Contracts preserved (DO NOT BREAK)

IDs: `connection-status`, `login-form`, `login-account-id`, `login-role`, `login-secret`, `controls-form`, `market-input`, `summary-view`, `accounts-view`, `balance-view`, `risk-usage-view`, `activity-view`, `orderbook-view`, `risk-view`.

Classes: `stale-note`, `bids`, `asks`, `best`, `more`, `status-badge`, `status-active`, `status-closed`, `account-holdings`, `asset-total`, `amount`, `holders`, `percent`, `recent-trades`.

Attributes: `data-state`, `data-account-id`, `data-status`, `data-asset`, `data-summary="accounts"`, `data-meter`, `data-level`, `data-trade`, `data-notional`, `aria-busy`, `role=alert`, table `caption`/`th`.

JS still uses `textContent` only for untrusted strings.

## Verification

| Gate | Result |
| --- | --- |
| `npm run typecheck` | **PASS** |
| `npm test challenge12.test.ts` | **PASS** (included in 36-test UI cluster) |
| `npm test challenge17.test.ts` | **PASS** |
| `npm test challenge20.test.ts` | **PASS** |
| `npm test challenge21.test.ts` | **PASS** |
| UI cluster (12+17+20+21) | **4/4 files, 36/36 tests** |
| `npm test` | **PASS** — 31/31 files, 279/279 (clean rerun after two load-contention timeouts on 4a-4 / 18e-1 that pass in isolation; CSS cannot cause those) |
| `git diff --check` | clean |
| Browser smoke | **NOT RUN** (no controllable browser) |
| Grading uploader | **NOT** executed |

## Remaining visual notes

Order-book depth heatmaps omitted by design. No fake P&amp;L or uptime. Swagger/docs routes untouched.
