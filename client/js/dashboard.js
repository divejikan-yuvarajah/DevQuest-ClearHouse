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
export function setStatus(doc, sectionId, state, message) {
  const section = doc.getElementById(sectionId);
  if (!section) return;

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
    tr.appendChild(textEl(doc, "td", String(row.asset ?? "")));
    tr.appendChild(textEl(doc, "td", String(row.available ?? "")));
    tr.appendChild(textEl(doc, "td", String(row.held ?? "")));
    tr.appendChild(textEl(doc, "td", String(row.total ?? "")));
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

  visible.forEach((level, index) => {
    const row = textEl(doc, "div", `${level.price} x ${level.quantity}`);
    if (index === 0) row.classList.add("best");
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

    row.appendChild(textEl(doc, "span", String(account.name ?? "")));

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
        const amount =
          typeof exponent === "number"
            ? formatMinorUnits(String(balance.total ?? "0"), exponent)
            : String(balance.total ?? "0");
        const item = textEl(doc, "li", `${asset} ${amount}`);
        item.dataset.asset = asset;
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
  const meter = doc.createElement("div");
  meter.dataset.meter = key;
  meter.dataset.level = usageLevel(percent);

  meter.appendChild(textEl(doc, "span", label));

  const percentEl = textEl(doc, "span", `${percent}%`);
  percentEl.className = "percent";
  meter.appendChild(percentEl);

  const progress = doc.createElement("progress");
  progress.max = 100;
  progress.value = Math.min(percent, 100);
  progress.setAttribute("aria-label", label);
  meter.appendChild(progress);

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

  appendRiskMeter(doc, section, "orders", "Open orders", openOrders, maxOpenOrders);
  appendRiskMeter(doc, section, "exposure", "Committed exposure", exposure, maxNotional);
}

/**
 * trades: Array<{ market, buyOrderId, sellOrderId, price, quantity, timestampMs }>
 * @param {Document} doc
 * @param {Array<{ market: string, buyOrderId: string, sellOrderId: string, price: string, quantity: string, timestampMs: number }>} trades
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

  for (const trade of expected) {
    const item = doc.createElement("li");
    item.dataset.trade = "";

    const market = String(trade.market ?? "");
    const quantity = String(trade.quantity ?? "");
    const price = String(trade.price ?? "");
    item.appendChild(textEl(doc, "span", `${market} ${quantity} @ ${price}`));

    const notional = textEl(doc, "span", (BigInt(price) * BigInt(quantity)).toString());
    notional.dataset.notional = "";
    item.appendChild(notional);

    const time = doc.createElement("time");
    time.setAttribute("datetime", new Date(trade.timestampMs).toISOString());
    item.appendChild(time);

    list.appendChild(item);
  }

  section.appendChild(list);
}

export function setConnectionStatus(_doc, _status) {
  throw new Error("setConnectionStatus is not implemented yet.");
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
