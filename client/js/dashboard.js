// Rendering helpers for the operator dashboard. See tests/challenge12.test.ts
// and tests/challenge17.test.ts for the contracts each export must satisfy.

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function textEl(doc, tag, text) {
  const el = doc.createElement(tag);
  el.textContent = text;
  return el;
}

/**
 * @param {Document} doc
 * @param {string} sectionId
 * @param {string} state
 * @param {string} [message]
 */
function defaultConnectionNote(status) {
  if (status === "reconnecting") return "Live feed reconnecting — showing last known market state";
  if (status === "stopped") return "Live feed stopped — showing last known market state";
  if (status === "stale") return "Live feed is stale — showing last known market state";
  return "Live feed status changed";
}

function removeStaleNotes(section) {
  for (const note of [...section.querySelectorAll(".stale-note")]) {
    note.remove();
  }
}

function ensureStaleNote(doc, section, text) {
  let note = section.querySelector(".stale-note");
  if (!note) {
    note = doc.createElement("p");
    note.className = "stale-note";
    section.insertBefore(note, section.firstChild);
  }
  note.textContent = text;
}

export function setStatus(doc, sectionId, state, message) {
  const section = doc.getElementById(sectionId);
  if (!section) return;

  if (state === "stale" || state === "reconnecting") {
    section.dataset.state = state;
    section.setAttribute("aria-busy", "false");
    section.removeAttribute("role");
    ensureStaleNote(
      doc,
      section,
      typeof message === "string" && message.length > 0 ? message : defaultConnectionNote(state),
    );
    return;
  }

  if (state === "ready") {
    section.dataset.state = "ready";
    section.setAttribute("aria-busy", "false");
    section.removeAttribute("role");
    removeStaleNotes(section);
    return;
  }

  section.dataset.state = state;
  clearChildren(section);

  if (state === "loading") {
    section.setAttribute("aria-busy", "true");
    section.removeAttribute("role");
  } else if (state === "error") {
    section.setAttribute("role", "alert");
    section.setAttribute("aria-busy", "false");
  } else {
    section.removeAttribute("role");
    section.setAttribute("aria-busy", "false");
  }

  if (typeof message === "string" && message.length > 0) {
    if (state === "empty") {
      const illus = doc.createElement("div");
      illus.className = "empty-illustration";
      illus.setAttribute("aria-hidden", "true");
      section.appendChild(illus);
    }
    section.appendChild(textEl(doc, "p", message));
  }
}

function markReady(section) {
  section.dataset.state = "ready";
  section.setAttribute("aria-busy", "false");
  section.removeAttribute("role");
  clearChildren(section);
}

/**
 * balances: Array<{ asset: string, available: string, held: string, total: string }>
 * @param {Document} doc
 * @param {Array<{ asset: string, available: string, held: string, total: string }>} balances
 */
export function renderBalance(doc, balances) {
  const section = doc.getElementById("balance-view");
  if (!section) return;

  if (!Array.isArray(balances) || balances.length === 0) {
    setStatus(doc, "balance-view", "empty", "No balances to display");
    return;
  }

  markReady(section);

  const table = doc.createElement("table");
  table.className = "balance-table";
  table.appendChild(textEl(doc, "caption", "Account balances"));

  const thead = doc.createElement("thead");
  const headerRow = doc.createElement("tr");
  for (const label of ["Asset", "Available", "Held", "Total"]) {
    const th = textEl(doc, "th", label);
    th.setAttribute("scope", "col");
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = doc.createElement("tbody");
  for (const row of balances) {
    const tr = doc.createElement("tr");
    const asset = textEl(doc, "td", String(row.asset ?? ""));
    asset.className = "bal-asset";
    tr.appendChild(asset);

    const available = textEl(doc, "td", String(row.available ?? ""));
    available.className = "bal-available";
    tr.appendChild(available);

    const held = textEl(doc, "td", String(row.held ?? ""));
    held.className = "bal-held";
    tr.appendChild(held);

    const total = textEl(doc, "td", String(row.total ?? ""));
    total.className = "bal-total";
    tr.appendChild(total);

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  section.appendChild(table);
}

/**
 * @param {string} price
 * @returns {bigint | null}
 */
function parsePrice(price) {
  if (typeof price !== "string" || !/^-?\d+$/.test(price)) return null;
  try {
    return BigInt(price);
  } catch {
    return null;
  }
}

/**
 * @param {Array<{ price: string, quantity: string }>} levels
 * @param {boolean} descending
 */
function sortLevels(levels, descending) {
  return [...levels].sort((a, b) => {
    const pa = parsePrice(a.price);
    const pb = parsePrice(b.price);
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    if (pa === pb) return 0;
    if (descending) return pa > pb ? -1 : 1;
    return pa < pb ? -1 : 1;
  });
}

/**
 * @param {Document} doc
 * @param {Array<{ price: string, quantity: string }>} levels
 * @param {string} sideClass
 */
function renderSide(doc, levels, sideClass) {
  const container = doc.createElement("div");
  container.className = sideClass;

  const sorted = sortLevels(levels, sideClass === "bids");
  const visible = sorted.slice(0, 10);
  const hidden = sorted.length - visible.length;

  const head = doc.createElement("header");
  head.className = "ob-cols";
  head.setAttribute("aria-hidden", "true");
  head.appendChild(textEl(doc, "span", "Price"));
  head.appendChild(textEl(doc, "span", "Quantity"));
  container.appendChild(head);

  visible.forEach((level, index) => {
    const row = doc.createElement("div");
    if (index === 0) row.classList.add("best");

    const price = textEl(doc, "span", String(level.price ?? ""));
    price.className = "ob-price";
    row.appendChild(price);
    row.appendChild(doc.createTextNode(" x "));
    const qty = textEl(doc, "span", String(level.quantity ?? ""));
    qty.className = "ob-qty";
    row.appendChild(qty);

    container.appendChild(row);
  });

  if (hidden > 0) {
    const more = textEl(doc, "div", `+${hidden} more`);
    more.classList.add("more");
    container.appendChild(more);
  }

  return container;
}

/**
 * Exact integer-string spread only — never uses floating Number math.
 * @param {Document} doc
 * @param {Array<{ price: string, quantity: string }>} bids
 * @param {Array<{ price: string, quantity: string }>} asks
 * @returns {HTMLElement | null}
 */
function renderSpreadDivider(doc, bids, asks) {
  if (bids.length === 0 || asks.length === 0) return null;
  const bestBid = sortLevels(bids, true)[0];
  const bestAsk = sortLevels(asks, false)[0];
  const bid = parsePrice(bestBid?.price ?? "");
  const ask = parsePrice(bestAsk?.price ?? "");
  if (bid === null || ask === null || ask < bid) return null;

  const el = doc.createElement("div");
  el.className = "ob-spread";
  el.setAttribute("aria-hidden", "true");
  const label = textEl(doc, "span", "Spread");
  label.className = "ob-spread-label";
  const value = textEl(doc, "span", (ask - bid).toString());
  value.className = "ob-spread-value";
  el.appendChild(label);
  el.appendChild(value);
  return el;
}

/**
 * book: { bids: Array<{ price: string, quantity: string }>, asks: Array<{ price: string, quantity: string }> }
 * @param {Document} doc
 * @param {{ bids: Array<{ price: string, quantity: string }>, asks: Array<{ price: string, quantity: string }> }} book
 */
export function renderOrderBook(doc, book) {
  const section = doc.getElementById("orderbook-view");
  if (!section) return;

  const bids = Array.isArray(book?.bids) ? book.bids : [];
  const asks = Array.isArray(book?.asks) ? book.asks : [];

  if (bids.length === 0 && asks.length === 0) {
    setStatus(doc, "orderbook-view", "empty", "Order book is empty");
    return;
  }

  markReady(section);
  if (bids.length > 0) section.appendChild(renderSide(doc, bids, "bids"));
  const spread = renderSpreadDivider(doc, bids, asks);
  if (spread) section.appendChild(spread);
  if (asks.length > 0) section.appendChild(renderSide(doc, asks, "asks"));
}

/**
 * risk: { openOrderCount: number, committedExposure: string }
 * @param {Document} doc
 * @param {{ openOrderCount: number, committedExposure: string }} risk
 */
export function renderRiskState(doc, risk) {
  const section = doc.getElementById("risk-view");
  if (!section) return;

  markReady(section);

  const list = doc.createElement("dl");
  list.className = "risk-state-list";
  list.appendChild(textEl(doc, "dt", "Open orders"));
  list.appendChild(textEl(doc, "dd", String(risk?.openOrderCount ?? "")));
  list.appendChild(textEl(doc, "dt", "Committed exposure"));
  list.appendChild(textEl(doc, "dd", String(risk?.committedExposure ?? "")));
  section.appendChild(list);
}

/**
 * @param {string} amount
 * @param {number} exponent
 * @returns {string}
 */
export function formatMinorUnits(amount, exponent) {
  if (typeof amount !== "string" || !/^-?\d+$/.test(amount)) {
    throw new RangeError("amount must be an integer string");
  }
  if (!Number.isInteger(exponent) || exponent < 0 || exponent > 18) {
    throw new RangeError("exponent must be an integer between 0 and 18");
  }

  const negative = amount.startsWith("-");
  const abs = negative ? -BigInt(amount) : BigInt(amount);
  // BigInt("-0") is 0n; treat signed zero as unsigned zero in the output.
  const showMinus = negative && abs !== 0n;
  const scale = 10n ** BigInt(exponent);
  const whole = (abs / scale).toString();
  if (exponent === 0) {
    return (showMinus ? "-" : "") + whole;
  }
  const fraction = (abs % scale).toString().padStart(exponent, "0");
  return (showMinus ? "-" : "") + whole + "." + fraction;
}

/**
 * @param {Array<{ code: string, name?: string, exponent: number }>} assets
 * @returns {Map<string, number>}
 */
function exponentMap(assets) {
  const map = new Map();
  if (!Array.isArray(assets)) return map;
  for (const asset of assets) {
    if (asset && typeof asset.code === "string" && Number.isInteger(asset.exponent)) {
      map.set(asset.code, asset.exponent);
    }
  }
  return map;
}

/**
 * @param {{ id: string, name: string }} a
 * @param {{ id: string, name: string }} b
 */
function accountNameOrder(a, b) {
  const x = String(a.name ?? "").toLowerCase();
  const y = String(b.name ?? "").toLowerCase();
  if (x < y) return -1;
  if (x > y) return 1;
  const idA = String(a.id ?? "");
  const idB = String(b.id ?? "");
  if (idA < idB) return -1;
  if (idA > idB) return 1;
  return 0;
}

/** Allowlisted account status → badge class. */
const STATUS_BADGE_CLASS = Object.freeze({
  active: "status-badge status-active",
  closed: "status-badge status-closed",
});

/**
 * accounts: Array<{ id, type, name, status, balances: Array<{ asset, available, held, total }> }>
 * assets: Array<{ code, name, exponent }>
 * @param {Document} doc
 * @param {Array<{ id: string, type: string, name: string, status: string, balances: Array<{ asset: string, available: string, held: string, total: string }> }>} accounts
 * @param {Array<{ code: string, name: string, exponent: number }>} assets
 */
export function renderAccountList(doc, accounts, assets) {
  const section = doc.getElementById("accounts-view");
  if (!section) return;

  if (!Array.isArray(accounts) || accounts.length === 0) {
    setStatus(doc, "accounts-view", "empty", "No accounts to display");
    return;
  }

  markReady(section);
  const exponents = exponentMap(assets);
  const ordered = [...accounts].sort(accountNameOrder);

  for (const account of ordered) {
    const row = doc.createElement("article");
    row.dataset.accountId = String(account.id ?? "");

    const name = String(account.name ?? "");
    const initial = doc.createElement("span");
    initial.className = "account-initial";
    initial.setAttribute("aria-hidden", "true");
    const glyph = name.trim().charAt(0);
    initial.textContent = glyph ? glyph.toUpperCase() : "?";
    row.appendChild(initial);

    const identity = doc.createElement("div");
    identity.className = "account-identity";
    const nameEl = textEl(doc, "span", name);
    nameEl.className = "account-name";
    identity.appendChild(nameEl);
    const idValue = String(account.id ?? "");
    if (idValue) {
      const idEl = textEl(doc, "span", idValue);
      idEl.className = "account-id";
      identity.appendChild(idEl);
    }
    row.appendChild(identity);

    const statusValue = String(account.status ?? "");
    const badge = doc.createElement("span");
    badge.dataset.status = statusValue;
    badge.className = STATUS_BADGE_CLASS[statusValue] ?? "status-badge status-unknown";
    badge.textContent = statusValue;
    row.appendChild(badge);

    const holdings = doc.createElement("ul");
    holdings.className = "account-holdings";
    const balances = Array.isArray(account.balances) ? account.balances : [];
    if (balances.length === 0) {
      holdings.appendChild(textEl(doc, "li", "No holdings"));
    } else {
      for (const balance of balances) {
        const asset = String(balance.asset ?? "");
        const exponent = exponents.get(asset);
        const totalRaw = String(balance.total ?? "0");
        const availableRaw = String(balance.available ?? "0");
        const heldRaw = String(balance.held ?? "0");
        const total =
          typeof exponent === "number" ? formatMinorUnits(totalRaw, exponent) : totalRaw;
        const available =
          typeof exponent === "number" ? formatMinorUnits(availableRaw, exponent) : availableRaw;
        const held =
          typeof exponent === "number" ? formatMinorUnits(heldRaw, exponent) : heldRaw;

        const item = doc.createElement("li");
        item.className = "holding-chip";

        const totalEl = textEl(doc, "span", `${asset} ${total}`);
        totalEl.dataset.asset = asset;
        totalEl.className = "holding-total";
        item.appendChild(totalEl);

        const breakdown = doc.createElement("span");
        breakdown.className = "holding-breakdown";
        breakdown.appendChild(textEl(doc, "span", `Avail ${available}`));
        breakdown.appendChild(textEl(doc, "span", `Held ${held}`));
        item.appendChild(breakdown);

        holdings.appendChild(item);
      }
    }
    row.appendChild(holdings);
    section.appendChild(row);
  }
}

/**
 * @param {Document} doc
 * @param {Array<{ id: string, type: string, name: string, status: string, balances: Array<{ asset: string, available: string, held: string, total: string }> }>} accounts
 * @param {Array<{ code: string, name: string, exponent: number }>} assets
 */
export function renderPortfolioSummary(doc, accounts, assets) {
  const section = doc.getElementById("summary-view");
  if (!section) return;

  if (!Array.isArray(accounts) || accounts.length === 0) {
    setStatus(doc, "summary-view", "empty", "No portfolio to summarize");
    return;
  }

  markReady(section);
  const exponents = exponentMap(assets);

  /** @type {Map<string, { total: bigint, holders: number }>} */
  const totals = new Map();
  for (const account of accounts) {
    const balances = Array.isArray(account.balances) ? account.balances : [];
    for (const balance of balances) {
      const asset = String(balance.asset ?? "");
      const holding = BigInt(String(balance.total ?? "0"));
      const entry = totals.get(asset) ?? { total: 0n, holders: 0 };
      entry.total += holding;
      if (holding !== 0n) entry.holders += 1;
      totals.set(asset, entry);
    }
  }

  const count = textEl(doc, "p", String(accounts.length));
  count.dataset.summary = "accounts";
  section.appendChild(count);

  const sortedAssets = [...totals.keys()].sort();
  for (const asset of sortedAssets) {
    const entry = totals.get(asset);
    const card = doc.createElement("div");
    card.className = "asset-total";
    card.dataset.asset = asset;

    const exponent = exponents.get(asset) ?? 0;
    const amount = textEl(doc, "span", formatMinorUnits(entry.total.toString(), exponent));
    amount.className = "amount";
    card.appendChild(amount);

    const holders = textEl(doc, "span", String(entry.holders));
    holders.className = "holders";
    card.appendChild(holders);

    section.appendChild(card);
  }
}

/**
 * Exact integer usage percent matching the Challenge 20c oracle.
 * @param {bigint} used
 * @param {bigint} limit
 * @returns {number}
 */
function usagePercent(used, limit) {
  if (used <= 0n) return 0;
  if (limit <= 0n) return 100;
  return Number((used * 100n) / limit);
}

/**
 * @param {number} percent
 * @returns {"ok" | "warning" | "danger"}
 */
function usageLevel(percent) {
  if (percent >= 100) return "danger";
  if (percent >= 80) return "warning";
  return "ok";
}

/**
 * @param {Document} doc
 * @param {HTMLElement} section
 * @param {string} key
 * @param {string} label
 * @param {bigint} used
 * @param {bigint} limit
 */
function appendRiskMeter(doc, section, key, label, used, limit) {
  const percent = usagePercent(used, limit);
  const level = usageLevel(percent);
  const meter = doc.createElement("div");
  meter.dataset.meter = key;
  meter.dataset.level = level;

  const head = doc.createElement("div");
  head.className = "meter-head";
  const labelEl = textEl(doc, "span", label);
  labelEl.className = "meter-label";
  head.appendChild(labelEl);

  const percentEl = textEl(doc, "span", `${percent}%`);
  percentEl.className = "percent";
  head.appendChild(percentEl);
  meter.appendChild(head);

  const figures = doc.createElement("div");
  figures.className = "meter-figures";
  figures.appendChild(textEl(doc, "span", `Used ${used.toString()}`));
  figures.appendChild(textEl(doc, "span", `Limit ${limit.toString()}`));
  meter.appendChild(figures);

  const progress = doc.createElement("progress");
  progress.max = 100;
  progress.value = Math.min(percent, 100);
  progress.setAttribute("aria-label", label);
  meter.appendChild(progress);

  const statusText = level === "danger" ? "Danger" : level === "warning" ? "Warning" : "Normal";
  const status = textEl(doc, "span", statusText);
  status.className = "meter-status";
  meter.appendChild(status);

  section.appendChild(meter);
}

/**
 * state: { openOrderCount: number, committedExposure: string }
 * limits: { maxNotional: string, maxOpenOrders: number, maxPositionAbs: string }
 * @param {Document} doc
 * @param {{ openOrderCount: number, committedExposure: string }} state
 * @param {{ maxNotional: string, maxOpenOrders: number, maxPositionAbs: string }} limits
 */
export function renderRiskUsage(doc, state, limits) {
  const section = doc.getElementById("risk-usage-view");
  if (!section) return;

  markReady(section);

  const openOrders = BigInt(state?.openOrderCount ?? 0);
  const maxOpenOrders = BigInt(limits?.maxOpenOrders ?? 0);
  const exposure = BigInt(String(state?.committedExposure ?? "0"));
  const maxNotional = BigInt(String(limits?.maxNotional ?? "0"));
  const maxPositionAbs = BigInt(String(limits?.maxPositionAbs ?? "0"));
  const absExposure = exposure < 0n ? -exposure : exposure;

  appendRiskMeter(doc, section, "orders", "Open orders", openOrders, maxOpenOrders);
  appendRiskMeter(doc, section, "exposure", "Committed exposure", exposure, maxNotional);
  appendRiskMeter(doc, section, "position", "Position absolute", absExposure, maxPositionAbs);
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
function shortenId(value) {
  const id = String(value ?? "");
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

/**
 * trades: Array<{ market, buyOrderId, sellOrderId, price, quantity, timestampMs, buyAccountId?, sellAccountId? }>
 * @param {Document} doc
 * @param {Array<{ market: string, buyOrderId: string, sellOrderId: string, price: string, quantity: string, timestampMs: number, buyAccountId?: string | null, sellAccountId?: string | null }>} trades
 */
export function renderRecentTrades(doc, trades) {
  const section = doc.getElementById("activity-view");
  if (!section) return;

  if (!Array.isArray(trades) || trades.length === 0) {
    setStatus(doc, "activity-view", "empty", "No recent trades");
    return;
  }

  markReady(section);

  const expected = [...trades]
    .map((trade, index) => ({ trade, index }))
    .sort((a, b) => b.trade.timestampMs - a.trade.timestampMs || b.index - a.index)
    .slice(0, 10)
    .map((x) => x.trade);

  const list = doc.createElement("ol");
  list.className = "recent-trades";

  const head = doc.createElement("li");
  head.className = "recent-trades-head";
  head.setAttribute("aria-hidden", "true");
  for (const label of ["Time", "Print", "Notional"]) {
    head.appendChild(textEl(doc, "span", label));
  }
  list.appendChild(head);

  for (const trade of expected) {
    const item = doc.createElement("li");
    item.dataset.trade = "";

    const market = String(trade.market ?? "");
    item.dataset.market = market;
    const quantity = String(trade.quantity ?? "");
    const price = String(trade.price ?? "");
    if (typeof trade.buyAccountId === "string" && trade.buyAccountId) {
      item.dataset.buyAccount = trade.buyAccountId;
    }
    if (typeof trade.sellAccountId === "string" && trade.sellAccountId) {
      item.dataset.sellAccount = trade.sellAccountId;
    }

    const time = doc.createElement("time");
    const iso = new Date(trade.timestampMs).toISOString();
    time.setAttribute("datetime", iso);
    time.textContent = iso.slice(11, 19) + "Z";
    item.appendChild(time);

    const body = doc.createElement("div");
    body.className = "trade-body";

    // Challenge 20c-4 requires this exact phrase in the row textContent.
    const print = textEl(doc, "span", `${market} ${quantity} @ ${price}`);
    print.className = "trade-print";
    body.appendChild(print);

    const buyAccount = trade.buyAccountId;
    const sellAccount = trade.sellAccountId;
    if ((typeof buyAccount === "string" && buyAccount) || (typeof sellAccount === "string" && sellAccount)) {
      const parties = doc.createElement("span");
      parties.className = "trade-parties";
      if (typeof buyAccount === "string" && buyAccount) {
        parties.appendChild(textEl(doc, "span", `Buy ${shortenId(buyAccount)}`));
      }
      if (typeof sellAccount === "string" && sellAccount) {
        parties.appendChild(textEl(doc, "span", `Sell ${shortenId(sellAccount)}`));
      }
      body.appendChild(parties);
    } else if (trade.buyOrderId || trade.sellOrderId) {
      const orders = doc.createElement("span");
      orders.className = "trade-orders";
      if (trade.buyOrderId) orders.appendChild(textEl(doc, "span", `Buy ord ${shortenId(trade.buyOrderId)}`));
      if (trade.sellOrderId) orders.appendChild(textEl(doc, "span", `Sell ord ${shortenId(trade.sellOrderId)}`));
      body.appendChild(orders);
    }

    item.appendChild(body);

    const notional = textEl(doc, "span", (BigInt(price) * BigInt(quantity)).toString());
    notional.dataset.notional = "";
    notional.className = "trade-notional";
    item.appendChild(notional);

    list.appendChild(item);
  }

  section.appendChild(list);
}

const CONNECTION_PANELS = ["balance-view", "orderbook-view", "risk-view"];

function isProtectedPanelState(state) {
  return state === "loading" || state === "empty" || state === "error";
}

function connectionBannerText(status) {
  switch (status) {
    case "connecting":
      return "CONNECTING";
    case "live":
      return "LIVE";
    case "stale":
      return "STALE";
    case "reconnecting":
      return "RECONNECTING";
    case "stopped":
      return "STOPPED";
    default:
      return status;
  }
}

function syncMarketLiveBadge(doc, status) {
  const badge = doc.getElementById("market-live-badge");
  if (!badge) return;
  badge.dataset.state = status;
  badge.textContent = connectionBannerText(status);
}

function syncSidebarLive(doc, status) {
  const live = doc.getElementById("sidebar-live");
  const label = doc.getElementById("sidebar-live-label");
  if (live) live.dataset.state = status;
  if (label) {
    if (status === "live") label.textContent = "Live infrastructure";
    else if (status === "connecting") label.textContent = "Connecting";
    else if (status === "reconnecting") label.textContent = "Reconnecting";
    else if (status === "stale") label.textContent = "Stale feed";
    else if (status === "stopped") label.textContent = "Feed stopped";
    else label.textContent = connectionBannerText(status);
  }
}

export function setConnectionStatus(doc, status) {
  const banner = doc.getElementById("connection-status");
  if (banner) {
    banner.dataset.state = status;
    banner.textContent = connectionBannerText(status);
  }
  syncMarketLiveBadge(doc, status);
  syncSidebarLive(doc, status);

  if (status === "connecting") return;

  let panelState = null;
  if (status === "stale" || status === "stopped") panelState = "stale";
  else if (status === "reconnecting") panelState = "reconnecting";
  else if (status === "live") panelState = "ready";
  if (!panelState) return;

  for (const id of CONNECTION_PANELS) {
    const section = doc.getElementById(id);
    if (!section) continue;
    const current = section.dataset.state || "";
    if (isProtectedPanelState(current)) continue;
    if (current !== "ready" && current !== "stale" && current !== "reconnecting") continue;

    if (panelState === "ready") {
      setStatus(doc, id, "ready");
    } else {
      const noteKey = panelState === "stale" && status === "stopped" ? "stopped" : panelState;
      setStatus(doc, id, panelState, defaultConnectionNote(noteKey));
    }
  }
}

/**
 * @param {{ method: string, path: string, body: unknown, timestamp: number, nonce: string }} input
 * @param {(input: unknown) => Promise<string>} signer
 * @returns {Promise<{ headers: Record<string, string>, body?: string }>}
 */
export async function buildSignedRequestInit(input, signer) {
  const { method, path, body, timestamp, nonce } = input;
  const rawBody = body === undefined ? undefined : JSON.stringify(body);
  const signature = await signer({ method, path, rawBody, timestamp, nonce });

  /** @type {Record<string, string>} */
  const headers = {
    "X-Signature": signature,
    // Challenge 12d asserts X-Signature-Algorithm; Challenge 1c / the server assert X-Algorithm.
    "X-Signature-Algorithm": "HMAC-SHA256",
    "X-Algorithm": "HMAC-SHA256",
    "X-Timestamp": String(timestamp),
    "X-Nonce": nonce,
  };

  if (rawBody !== undefined) {
    headers["Content-Type"] = "application/json";
    return { headers, body: rawBody };
  }
  return { headers };
}
