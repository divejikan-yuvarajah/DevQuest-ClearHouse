import { renderBalance, renderOrderBook, renderRiskState, renderRiskUsage, renderAccountList, renderPortfolioSummary, renderRecentTrades, setStatus, setConnectionStatus, buildSignedRequestInit, formatMinorUnits } from "./dashboard.js";
import { LiveFeedClient, applyOrderBookDelta } from "./liveFeed.js";
import { createHmacSigner } from "./signer.js";

let secret = "";
let accountId = "";
let accessToken = "";
/** @type {LiveFeedClient | null} */
let liveFeed = null;
/** @type {Array<{ id: string, type: string, name: string, status: string, balances: Array<{ asset: string, available: string, held: string, total: string }> }>} */
let cachedAccounts = [];
/** @type {Array<{ code: string, name: string, exponent: number }>} */
let cachedAssets = [];

async function hmacSigner(input) {
  return createHmacSigner(secret)(input);
}

async function signedFetch(method, path, body) {
  const init = await buildSignedRequestInit({ method, path, body, timestamp: Date.now(), nonce: crypto.randomUUID() }, hmacSigner);
  if (accessToken) {
    init.headers = { ...(init.headers || {}), Authorization: `Bearer ${accessToken}` };
  }
  const response = await fetch(path, init);
  return { status: response.status, body: await response.json().catch(() => null) };
}

async function bearerFetch(method, path, body) {
  const headers = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  /** @type {RequestInit} */
  const init = { method, headers };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const response = await fetch(path, init);
  return { status: response.status, body: await response.json().catch(() => null) };
}

async function refresh(market) {
  setStatus(document, "balance-view", "loading");
  setStatus(document, "orderbook-view", "loading");
  setStatus(document, "risk-view", "loading");
  setStatus(document, "risk-usage-view", "loading");

  try {
    const assets = await bearerFetch("GET", "/api/assets", undefined);
    if (assets.status !== 200) throw new Error("assets");
    const balances = [];
    for (const asset of assets.body.data) {
      const balance = secret
        ? await signedFetch("GET", `/api/settlement/accounts/${accountId}/balance?asset=${encodeURIComponent(asset.code)}`, undefined)
        : await bearerFetch("GET", `/api/settlement/accounts/${accountId}/balance?asset=${encodeURIComponent(asset.code)}`, undefined);
      if (balance.status !== 200) throw new Error("balance");
      const { available, held, total } = balance.body.data;
      if (total !== "0") balances.push({ asset: asset.code, available, held, total });
    }
    renderBalance(document, balances);
  } catch {
    setStatus(document, "balance-view", "error", "Could not load balance");
  }

  try {
    const book = await bearerFetch("GET", `/api/orders/book/${encodeURIComponent(market)}/depth`, undefined);
    if (book.status === 200) {
      renderOrderBook(document, book.body.data);
    } else {
      setStatus(document, "orderbook-view", "error", "Could not load order book");
    }
  } catch {
    setStatus(document, "orderbook-view", "error", "Could not load order book");
  }

  try {
    const risk = await bearerFetch("GET", `/api/risk/accounts/${accountId}/state`, undefined);
    if (risk.status === 200) {
      renderRiskState(document, risk.body.data);
      renderRiskUsage(document, risk.body.data, risk.body.data.limits);
    } else {
      setStatus(document, "risk-view", "error", "Could not load risk state");
      setStatus(document, "risk-usage-view", "error", "Could not load risk usage");
    }
  } catch {
    setStatus(document, "risk-view", "error", "Could not load risk state");
    setStatus(document, "risk-usage-view", "error", "Could not load risk usage");
  }

  startLiveFeedForMarket(market);
  markClientRefreshed();
}

async function getJson(path) {
  const response = await fetch(path);
  if (response.status !== 200) throw new Error(path);
  return (await response.json()).data;
}

async function loadOverview() {
  setStatus(document, "accounts-view", "loading", "Loading accounts…");
  setStatus(document, "summary-view", "loading", "Loading summary…");
  const marketInput = document.getElementById("market-input");
  updateStatusStrip({ market: marketInput?.value || "BTC-USD" });
  try {
    const [assets, accounts] = await Promise.all([getJson("/api/assets"), getJson("/api/ledger/accounts")]);
    cachedAssets = Array.isArray(assets) ? assets : [];
    cachedAccounts = Array.isArray(accounts) ? accounts : [];
    renderPortfolioSummary(document, accounts, assets);
    renderAccountList(document, accounts, assets);
    applyAccountFilters();
    updateStatusStrip({ accounts: Array.isArray(accounts) ? accounts.length : 0 });
    updateAccountsIdentity(Array.isArray(accounts) ? accounts.length : null);
    updateRiskContext();
    markClientRefreshed();
  } catch {
    cachedAccounts = [];
    cachedAssets = [];
    setStatus(document, "accounts-view", "error", "Could not load accounts");
    setStatus(document, "summary-view", "error", "Could not load the portfolio summary");
    updateStatusStrip({ accounts: null });
    updateAccountsIdentity(null);
    clearAccountDetail();
    updateRiskContext();
  }
  try {
    renderRecentTrades(document, await getJson("/api/orders/trades?limit=10"));
    applyActivityFilter();
    markClientRefreshed();
  } catch {
    setStatus(document, "activity-view", "error", "Could not load recent trades");
  }
}

document.getElementById("accounts-view").addEventListener("click", (event) => {
  const row = event.target.closest("[data-account-id]");
  if (!row) return;
  const selectedId = row.dataset.accountId;
  document.getElementById("login-account-id").value = selectedId;
  for (const item of document.querySelectorAll("#accounts-view [data-account-id]")) {
    if (item === row) item.setAttribute("aria-selected", "true");
    else item.removeAttribute("aria-selected");
  }
  showAccountDetail(selectedId);
});

function updateRiskContext() {
  const selected = document.getElementById("risk-selected-account");
  const closedBanner = document.getElementById("risk-closed-banner");
  const id = String(accountId || document.getElementById("login-account-id")?.value || "").trim();

  if (selected) {
    selected.textContent = id
      ? id
      : "Sign in with an account ID to load balances and limits";
  }

  if (!closedBanner) return;
  if (!id) {
    closedBanner.hidden = true;
    return;
  }
  const account = cachedAccounts.find((entry) => entry && entry.id === id);
  closedBanner.hidden = !(account && account.status === "closed");
}

function updateAccountsIdentity(count) {
  const badge = document.getElementById("accounts-count-badge");
  if (!badge) return;
  if (count === null || count === undefined) {
    badge.textContent = "—";
    return;
  }
  badge.textContent = count === 1 ? "1 account" : `${count} accounts`;
}

function clearAccountDetail() {
  const empty = document.getElementById("account-detail-empty");
  const body = document.getElementById("account-detail-body");
  if (empty) empty.hidden = false;
  if (body) {
    body.hidden = true;
    while (body.firstChild) body.removeChild(body.firstChild);
  }
}

/**
 * @param {string} code
 * @param {string} amount
 */
function formatHolding(code, amount) {
  const asset = cachedAssets.find((entry) => entry && entry.code === code);
  if (asset && Number.isInteger(asset.exponent)) {
    try {
      return formatMinorUnits(String(amount ?? "0"), asset.exponent);
    } catch {
      return String(amount ?? "0");
    }
  }
  return String(amount ?? "0");
}

/**
 * Detail pane uses only already-loaded account list fields (no new API).
 * @param {string} selectedId
 */
function showAccountDetail(selectedId) {
  const empty = document.getElementById("account-detail-empty");
  const body = document.getElementById("account-detail-body");
  if (!body) return;

  while (body.firstChild) body.removeChild(body.firstChild);
  const account = cachedAccounts.find((entry) => entry && entry.id === selectedId);
  if (!account) {
    if (empty) empty.hidden = false;
    body.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  body.hidden = false;

  const head = document.createElement("div");
  head.className = "account-detail-head";
  const title = document.createElement("h3");
  title.textContent = String(account.name ?? "");
  head.appendChild(title);
  const status = document.createElement("span");
  status.dataset.status = String(account.status ?? "");
  status.className =
    account.status === "active"
      ? "status-badge status-active"
      : account.status === "closed"
        ? "status-badge status-closed"
        : "status-badge status-unknown";
  status.textContent = String(account.status ?? "");
  head.appendChild(status);
  body.appendChild(head);

  const idLine = document.createElement("p");
  idLine.className = "account-detail-id";
  const idValue = String(account.id ?? "");
  idLine.appendChild(document.createTextNode(idValue));
  if (idValue) {
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-btn";
    copy.setAttribute("aria-label", "Copy account ID");
    copy.textContent = "Copy";
    copy.addEventListener("click", () => {
      void copyText(idValue, "Account ID copied");
    });
    idLine.appendChild(copy);
  }
  body.appendChild(idLine);

  const balances = Array.isArray(account.balances) ? account.balances : [];
  if (balances.length === 0) {
    const none = document.createElement("p");
    none.className = "account-detail-empty-line";
    none.textContent = "No holdings";
    body.appendChild(none);
    return;
  }

  const table = document.createElement("table");
  table.className = "account-detail-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const label of ["Asset", "Available", "Held", "Total"]) {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const balance of balances) {
    const asset = String(balance.asset ?? "");
    const tr = document.createElement("tr");
    const cells = [
      asset,
      formatHolding(asset, balance.available),
      formatHolding(asset, balance.held),
      formatHolding(asset, balance.total),
    ];
    for (const value of cells) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  body.appendChild(table);
}

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = document.getElementById("login-form");
  if (form) form.dataset.state = "";
  accountId = document.getElementById("login-account-id").value;
  secret = document.getElementById("login-secret").value;
  const role = document.getElementById("login-role").value;
  const market = document.getElementById("market-input").value;
  void (async () => {
    try {
      const login = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ accountId, role }),
      });
      const payload = await login.json().catch(() => null);
      if (login.status !== 200 || !payload?.data?.accessToken) {
        setConnectionStatus(document, "stopped");
        setStatus(document, "balance-view", "error", "Sign-in failed");
        setOperatorSession("error", { accountId, role });
        return;
      }
      accessToken = payload.data.accessToken;
      const secretInput = document.getElementById("login-secret");
      if (secretInput) secretInput.value = "";
      setOperatorSession("active", { accountId, role });
      await refresh(market);
      await loadOverview();
      updateRiskContext();
    } catch {
      setStatus(document, "balance-view", "error", "Sign-in failed");
      setOperatorSession("error", { accountId, role });
    }
  })();
});

/**
 * Presentation-only session chrome. Does not change auth tokens or signing.
 * @param {"idle" | "active" | "error"} state
 * @param {{ accountId?: string, role?: string }} [details]
 */
function setOperatorSession(state, details = {}) {
  const access = document.getElementById("operator-access");
  if (access) access.dataset.session = state === "active" ? "active" : state === "error" ? "error" : "idle";

  const form = document.getElementById("login-form");
  if (form) form.dataset.state = state === "error" ? "error" : "";

  const identity = document.getElementById("operator-identity");
  const accountEl = document.getElementById("operator-session-account");
  const roleEl = document.getElementById("operator-session-role");
  const statusEl = document.getElementById("operator-session-status");
  const account = String(details.accountId ?? accountId ?? "").trim();
  const role = String(details.role ?? "").trim();

  if (state === "active") {
    if (identity) identity.textContent = `${role} · ${account}`;
    if (accountEl) accountEl.textContent = account || "—";
    if (roleEl) roleEl.textContent = role || "—";
    if (statusEl) statusEl.textContent = "Active";
    const meta = document.querySelector(".operator-session-meta");
    if (meta) meta.setAttribute("aria-hidden", "false");
    return;
  }

  if (state === "error") {
    if (identity) identity.textContent = "Sign-in failed";
    if (statusEl) statusEl.textContent = "Failed";
    if (accountEl) accountEl.textContent = account || "—";
    if (roleEl) roleEl.textContent = role || "—";
    const meta = document.querySelector(".operator-session-meta");
    if (meta) meta.setAttribute("aria-hidden", "true");
    return;
  }

  if (identity) identity.textContent = "Not signed in";
  if (accountEl) accountEl.textContent = "—";
  if (roleEl) roleEl.textContent = "—";
  if (statusEl) statusEl.textContent = "Idle";
  const meta = document.querySelector(".operator-session-meta");
  if (meta) meta.setAttribute("aria-hidden", "true");
}

document.getElementById("controls-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const market = document.getElementById("market-input").value;
  updateStatusStrip({ market });
  updateMarketIdentity(market);
  void (async () => {
    await refresh(market);
    await loadOverview();
    const view = document.getElementById("app-shell")?.dataset.view;
    if (view === "health") await loadHealth();
    if (view === "metrics") await loadMetrics();
    showToast("Refresh successful", "ok");
  })();
});

function startLiveFeedForMarket(market) {
  if (!accessToken || !market) return;
  if (liveFeed) {
    liveFeed.stop();
    liveFeed = null;
  }
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${protocol}//${location.host}/ws?token=${encodeURIComponent(accessToken)}`;
  let book = { bids: [], asks: [] };
  liveFeed = new LiveFeedClient({
    url,
    topics: [`orderbook:${market}`],
    createSocket: (target) => new WebSocket(target),
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (id) => clearTimeout(id),
    random: () => Math.random(),
    onStatus: (status) => setConnectionStatus(document, status),
    onMessage: (topic, message) => {
      if (!topic.startsWith("orderbook:")) return;
      book = message.kind === "snapshot" ? message.data : applyOrderBookDelta(book, message.data);
      renderOrderBook(document, book);
    },
  });
  liveFeed.start();
}

function startLiveFeed(url) {
  let book = { bids: [], asks: [] };
  const client = new LiveFeedClient({
    url,
    topics: ["orderbook", "balance", "risk"],
    createSocket: (target) => new WebSocket(target),
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (id) => clearTimeout(id),
    random: () => Math.random(),
    onStatus: (status) => setConnectionStatus(document, status),
    onMessage: (topic, message) => {
      if (topic === "orderbook" || topic.startsWith("orderbook:")) {
        book = message.kind === "snapshot" ? message.data : applyOrderBookDelta(book, message.data);
        renderOrderBook(document, book);
      } else if (topic === "balance") {
        renderBalance(document, message.data.balances);
      } else if (topic === "risk") {
        renderRiskState(document, message.data);
      }
    },
  });
  client.start();
}

const VIEW_META = {
  overview: {
    title: "Clearing Operations",
    eyebrow: "ClearHouse / Overview",
    lead: "Real-time visibility across accounts, market activity, exposure and settlement.",
  },
  markets: {
    title: "Markets",
    eyebrow: "ClearHouse / Markets",
    lead: "Institutional order-book terminal with real-time depth and recent prints.",
  },
  accounts: {
    title: "Accounts",
    eyebrow: "ClearHouse / Accounts",
    lead: "Participant accounts and asset holdings.",
  },
  activity: {
    title: "Activity",
    eyebrow: "ClearHouse / Activity",
    lead: "Recent executions and clearing activity.",
  },
  risk: {
    title: "Risk & Balances",
    eyebrow: "ClearHouse / Risk",
    lead: "Monitor exposure, limits and collateral.",
  },
  health: {
    title: "System Health",
    eyebrow: "ClearHouse / Platform",
    lead: "Runtime and dependency readiness.",
  },
  metrics: {
    title: "Platform Metrics",
    eyebrow: "ClearHouse / Platform",
    lead: "Request and runtime activity.",
  },
};

function updateStatusStrip({ market, accounts, health } = {}) {
  const marketEl = document.getElementById("strip-market");
  const accountsEl = document.getElementById("strip-accounts");
  const healthEl = document.getElementById("strip-health");
  if (marketEl && market !== undefined) marketEl.textContent = market || "—";
  if (accountsEl && accounts !== undefined) accountsEl.textContent = accounts === null ? "—" : String(accounts);
  if (healthEl && health !== undefined) healthEl.textContent = health || "—";
}

function formatMarketLabel(market) {
  const raw = String(market || "").trim();
  if (!raw) return "—";
  const parts = raw.split("-").filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} / ${parts.slice(1).join("-")}`;
  return raw;
}

function updateMarketIdentity(market) {
  const title = document.getElementById("market-title");
  if (title) title.textContent = formatMarketLabel(market);
  const strip = document.getElementById("strip-market");
  if (strip && market) strip.textContent = market;
}

function setView(view) {
  const next = VIEW_META[view] ? view : "overview";
  const shell = document.getElementById("app-shell");
  if (shell) shell.dataset.view = next;
  const meta = VIEW_META[next];
  const title = document.getElementById("page-title");
  const eyebrow = document.getElementById("page-eyebrow");
  const lead = document.getElementById("page-lead");
  if (title) title.textContent = meta.title;
  if (eyebrow) eyebrow.textContent = meta.eyebrow;
  if (lead) lead.textContent = meta.lead;
  const identity = document.getElementById("market-identity");
  if (identity) identity.hidden = next !== "markets";
  if (next === "markets") {
    updateMarketIdentity(document.getElementById("market-input")?.value || "BTC-USD");
  }
  const accountsIdentity = document.getElementById("accounts-identity");
  if (accountsIdentity) accountsIdentity.hidden = next !== "accounts";
  const accountsToolbar = document.getElementById("accounts-toolbar");
  if (accountsToolbar) accountsToolbar.hidden = next !== "accounts";
  const accountDetail = document.getElementById("account-detail");
  if (accountDetail) accountDetail.hidden = next !== "accounts";
  if (next !== "accounts") clearAccountDetail();
  const activityIdentity = document.getElementById("activity-identity");
  if (activityIdentity) activityIdentity.hidden = next !== "activity";
  const activityToolbar = document.getElementById("activity-toolbar");
  if (activityToolbar) activityToolbar.hidden = next !== "activity";
  const riskIdentity = document.getElementById("risk-identity");
  if (riskIdentity) riskIdentity.hidden = next !== "risk";
  const riskClosed = document.getElementById("risk-closed-banner");
  if (riskClosed && next !== "risk") riskClosed.hidden = true;
  if (next === "risk") updateRiskContext();
  const focusToggle = document.getElementById("focus-toggle");
  if (focusToggle) focusToggle.hidden = next !== "markets";
  if (next !== "markets") setMarketFocus(false);
  for (const item of document.querySelectorAll("[data-nav]")) {
    if (item.getAttribute("data-nav") === next) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  }
  if (next === "health") void loadHealth();
  if (next === "metrics") void loadMetrics();
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("nav-toggle");
  const appShell = document.getElementById("app-shell");
  if (appShell) appShell.classList.remove("nav-open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  if (sidebar) sidebar.scrollTop = 0;
  if (location.hash !== `#${next}`) history.replaceState(null, "", `#${next}`);
}

function clearSection(section) {
  while (section.firstChild) section.removeChild(section.firstChild);
}

function appendPair(section, label, value) {
  let list = section.querySelector("dl.kv");
  if (!list) {
    list = document.createElement("dl");
    list.className = "kv";
    section.appendChild(list);
  }
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.className = "financial-value";
  dd.textContent = value;
  list.appendChild(dt);
  list.appendChild(dd);
}

function buildHealthCard(title) {
  const card = document.createElement("article");
  card.className = "health-card";
  card.dataset.tone = "unknown";

  const top = document.createElement("div");
  top.className = "health-card-top";
  const dot = document.createElement("span");
  dot.className = "health-dot";
  dot.setAttribute("aria-hidden", "true");
  const heading = document.createElement("h3");
  heading.textContent = title;
  top.appendChild(dot);
  top.appendChild(heading);

  const state = document.createElement("p");
  state.className = "health-card-state";
  state.textContent = "Checking";

  const meta = document.createElement("dl");
  meta.className = "health-meta";

  card.appendChild(top);
  card.appendChild(state);
  card.appendChild(meta);
  return { card, state, meta };
}

function setHealthCard(cardParts, { tone, label, rows }) {
  cardParts.card.dataset.tone = tone;
  cardParts.state.textContent = label;
  clearSection(cardParts.meta);
  for (const [key, value] of rows) {
    if (value === null || value === undefined || value === "") continue;
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = String(value);
    cardParts.meta.appendChild(dt);
    cardParts.meta.appendChild(dd);
  }
}

function renderHealthShell(section) {
  clearSection(section);

  const head = document.createElement("header");
  head.className = "health-console-head";

  const copy = document.createElement("div");
  const kicker = document.createElement("p");
  kicker.className = "health-kicker";
  kicker.textContent = "System Health";
  const title = document.createElement("h2");
  title.className = "health-title";
  title.textContent = "SYSTEM HEALTH";
  const sub = document.createElement("p");
  sub.className = "health-sub";
  sub.textContent = "Runtime and dependency readiness";
  copy.appendChild(kicker);
  copy.appendChild(title);
  copy.appendChild(sub);

  const refresh = document.createElement("button");
  refresh.type = "button";
  refresh.className = "health-refresh";
  refresh.textContent = "Refresh";
  refresh.setAttribute("aria-label", "Refresh system health");
  refresh.addEventListener("click", () => {
    void loadHealth();
  });

  head.appendChild(copy);
  head.appendChild(refresh);

  const cards = document.createElement("div");
  cards.className = "health-cards";
  const application = buildHealthCard("Application");
  const database = buildHealthCard("Database");
  cards.appendChild(application.card);
  cards.appendChild(database.card);

  section.appendChild(head);
  section.appendChild(cards);
  return { application, database, refresh };
}

function classifyApplication(healthRes, health) {
  if (!healthRes) {
    return { tone: "unknown", label: "Unknown", rows: [["Probe", "/health"], ["Detail", "Request failed"]] };
  }
  const statusText = health?.data?.status != null ? String(health.data.status) : null;
  const rows = [
    ["Probe", "/health"],
    ["HTTP", String(healthRes.status)],
  ];
  if (statusText) rows.push(["Status", statusText]);

  if (healthRes.ok && (statusText === null || statusText === "ok" || statusText === "healthy")) {
    return { tone: "ok", label: "Healthy", rows };
  }
  if (healthRes.ok) {
    return { tone: "warn", label: "Degraded", rows };
  }
  return { tone: "bad", label: "Unhealthy", rows };
}

function classifyDatabase(readyRes, ready) {
  if (!readyRes) {
    return { tone: "unknown", label: "Unknown", rows: [["Probe", "/ready"], ["Detail", "Request failed"]] };
  }
  const statusText = ready?.data?.status != null ? String(ready.data.status) : null;
  const errorCode = ready?.error?.code != null ? String(ready.error.code) : null;
  const rows = [
    ["Probe", "/ready"],
    ["HTTP", String(readyRes.status)],
  ];
  if (statusText) rows.push(["Status", statusText]);
  if (errorCode) rows.push(["Code", errorCode]);

  if (readyRes.status === 200) {
    return { tone: "ok", label: "Ready", rows };
  }
  if (readyRes.status === 503 || errorCode === "NOT_READY") {
    return { tone: "bad", label: "Unavailable", rows };
  }
  return { tone: "warn", label: "Unknown", rows };
}

async function loadHealth() {
  const section = document.getElementById("health-view");
  if (!section) return;
  const { application, database, refresh } = renderHealthShell(section);
  section.dataset.state = "loading";
  refresh.disabled = true;
  setHealthCard(application, { tone: "unknown", label: "Checking", rows: [["Probe", "/health"]] });
  setHealthCard(database, { tone: "unknown", label: "Checking", rows: [["Probe", "/ready"]] });

  let healthRes = null;
  let readyRes = null;
  let health = null;
  let ready = null;

  try {
    const settled = await Promise.allSettled([fetch("/health"), fetch("/ready")]);
    if (settled[0].status === "fulfilled") {
      healthRes = settled[0].value;
      health = await healthRes.json().catch(() => null);
    }
    if (settled[1].status === "fulfilled") {
      readyRes = settled[1].value;
      ready = await readyRes.json().catch(() => null);
    }

    const appState = classifyApplication(healthRes, health);
    const dbState = classifyDatabase(readyRes, ready);
    setHealthCard(application, appState);
    setHealthCard(database, dbState);

    const overallOk = appState.tone === "ok" && dbState.tone === "ok";
    const overallBad = appState.tone === "bad" || dbState.tone === "bad";
    section.dataset.state = overallOk ? "ready" : overallBad ? "error" : "degraded";

    if (dbState.tone === "ok") {
      updateStatusStrip({ health: "Ready" });
      const env = document.getElementById("env-status");
      if (env) {
        env.dataset.state = "ready";
        env.textContent = "Ready";
      }
    } else if (dbState.tone === "bad") {
      updateStatusStrip({ health: "Not ready" });
      const env = document.getElementById("env-status");
      if (env) {
        env.dataset.state = "error";
        env.textContent = "Not ready";
      }
    } else {
      updateStatusStrip({ health: "Unknown" });
    }
  } catch {
    section.dataset.state = "error";
    setHealthCard(application, {
      tone: "bad",
      label: "Unhealthy",
      rows: [["Probe", "/health"], ["Detail", "Could not reach probe"]],
    });
    setHealthCard(database, {
      tone: "bad",
      label: "Unavailable",
      rows: [["Probe", "/ready"], ["Detail", "Could not reach probe"]],
    });
    updateStatusStrip({ health: "Not ready" });
  } finally {
    refresh.disabled = false;
  }
}

function formatMetricNumber(value, decimals = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function formatUptime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatErrorRate(rate) {
  const num = Number(rate);
  if (!Number.isFinite(num)) return "—";
  return `${(num * 100).toFixed(2)}%`;
}

function buildMetricCard({ label, value, support, tone = "neutral", meter }) {
  const card = document.createElement("article");
  card.className = "metric-tile";
  card.dataset.tone = tone;

  const valueEl = document.createElement("p");
  valueEl.className = "metric-tile-value";
  valueEl.textContent = value;

  const labelEl = document.createElement("p");
  labelEl.className = "metric-tile-label";
  labelEl.textContent = label;

  card.appendChild(valueEl);
  card.appendChild(labelEl);

  if (support) {
    const supportEl = document.createElement("p");
    supportEl.className = "metric-tile-support";
    supportEl.textContent = support;
    card.appendChild(supportEl);
  }

  if (meter && Number.isFinite(meter.ratio)) {
    const track = document.createElement("div");
    track.className = "metric-tile-meter";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("span");
    fill.style.width = `${Math.max(0, Math.min(100, meter.ratio * 100))}%`;
    track.appendChild(fill);
    card.appendChild(track);
  }

  return card;
}

function renderMetricsShell(section) {
  clearSection(section);

  const head = document.createElement("header");
  head.className = "metrics-console-head";

  const copy = document.createElement("div");
  const kicker = document.createElement("p");
  kicker.className = "metrics-kicker";
  kicker.textContent = "Platform Metrics";
  const title = document.createElement("h2");
  title.className = "metrics-title";
  title.textContent = "PLATFORM METRICS";
  const sub = document.createElement("p");
  sub.className = "metrics-sub";
  sub.textContent = "Request and runtime activity";
  copy.appendChild(kicker);
  copy.appendChild(title);
  copy.appendChild(sub);

  const refresh = document.createElement("button");
  refresh.type = "button";
  refresh.className = "metrics-refresh";
  refresh.textContent = "Refresh";
  refresh.setAttribute("aria-label", "Refresh platform metrics");
  refresh.addEventListener("click", () => {
    void loadMetrics();
  });

  head.appendChild(copy);
  head.appendChild(refresh);

  const cards = document.createElement("div");
  cards.className = "metrics-cards";

  const tableHost = document.createElement("div");
  tableHost.className = "metrics-table-host";

  section.appendChild(head);
  section.appendChild(cards);
  section.appendChild(tableHost);
  return { cards, tableHost, refresh };
}

function renderEndpointTable(host, stats) {
  clearSection(host);
  if (!Array.isArray(stats) || stats.length === 0) return;

  const wrap = document.createElement("div");
  wrap.className = "metrics-table-wrap";

  const caption = document.createElement("p");
  caption.className = "metrics-table-caption";
  caption.textContent = "Route activity";

  const table = document.createElement("table");
  table.className = "metrics-table";
  const thead = document.createElement("thead");
  const header = document.createElement("tr");
  for (const label of ["Route", "Requests", "Avg ms", "Error rate"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    header.appendChild(th);
  }
  thead.appendChild(header);
  table.appendChild(thead);

  const body = document.createElement("tbody");
  for (const row of stats) {
    const tr = document.createElement("tr");
    const endpoint = document.createElement("td");
    endpoint.className = "metrics-route";
    endpoint.textContent = String(row.endpoint ?? "");
    tr.appendChild(endpoint);

    const count = document.createElement("td");
    count.className = "metrics-num";
    count.textContent = formatMetricNumber(row.requestCount);
    tr.appendChild(count);

    const avg = document.createElement("td");
    avg.className = "metrics-num";
    avg.textContent = formatMetricNumber(row.averageResponseTime, 3);
    tr.appendChild(avg);

    const err = document.createElement("td");
    err.className = "metrics-num";
    err.textContent = formatErrorRate(row.errorRate);
    tr.appendChild(err);

    body.appendChild(tr);
  }
  table.appendChild(body);
  wrap.appendChild(caption);
  wrap.appendChild(table);
  host.appendChild(wrap);
}

async function loadMetrics() {
  const section = document.getElementById("metrics-view");
  if (!section) return;
  const { cards, tableHost, refresh } = renderMetricsShell(section);
  section.dataset.state = "loading";
  refresh.disabled = true;

  const loading = document.createElement("p");
  loading.className = "metrics-loading";
  loading.textContent = "Loading metrics…";
  cards.appendChild(loading);

  try {
    const payload = await getJson("/api/metrics");
    clearSection(cards);
    section.dataset.state = "ready";

    const totalRequests = payload.totalRequests;
    const avgMs = payload.averageResponseTime;
    const errorRate = payload.errorRate;
    const healthScore = payload.healthScore;
    const uptimeSeconds = payload.uptimeSeconds;
    const db = payload.databaseMetrics && typeof payload.databaseMetrics === "object" ? payload.databaseMetrics : null;
    const memory = payload.memoryUsage && typeof payload.memoryUsage === "object" ? payload.memoryUsage : null;

    if (totalRequests !== undefined) {
      cards.appendChild(
        buildMetricCard({
          label: "Requests",
          value: formatMetricNumber(totalRequests),
          support: "Total served",
          tone: "neutral",
        }),
      );
    }

    if (avgMs !== undefined) {
      cards.appendChild(
        buildMetricCard({
          label: "Avg response",
          value: `${formatMetricNumber(avgMs, 3)} ms`,
          support: "Across all requests",
          tone: Number(avgMs) >= 100 ? "warn" : "ok",
        }),
      );
    }

    if (errorRate !== undefined) {
      const rate = Number(errorRate);
      cards.appendChild(
        buildMetricCard({
          label: "Error rate",
          value: formatErrorRate(errorRate),
          support: "5xx / requests",
          tone: rate > 0.05 ? "bad" : rate > 0 ? "warn" : "ok",
        }),
      );
    }

    if (healthScore !== undefined) {
      const score = Number(healthScore);
      cards.appendChild(
        buildMetricCard({
          label: "Health score",
          value: formatMetricNumber(score),
          support: "Derived from latency & errors",
          tone: score >= 80 ? "ok" : score >= 50 ? "warn" : "bad",
          meter: Number.isFinite(score) ? { ratio: score / 100 } : undefined,
        }),
      );
    }

    if (uptimeSeconds !== undefined) {
      cards.appendChild(
        buildMetricCard({
          label: "Uptime",
          value: formatUptime(uptimeSeconds),
          support: `${formatMetricNumber(uptimeSeconds, 1)} s`,
          tone: "neutral",
        }),
      );
    }

    if (db) {
      if (db.totalQueries !== undefined) {
        cards.appendChild(
          buildMetricCard({
            label: "DB queries",
            value: formatMetricNumber(db.totalQueries),
            support:
              db.slowQueries !== undefined
                ? `${formatMetricNumber(db.slowQueries)} slow · avg ${formatMetricNumber(db.averageQueryTime ?? 0, 3)} ms`
                : "Database activity",
            tone: Number(db.slowQueries) > 0 ? "warn" : "ok",
          }),
        );
      }
    }

    if (memory && memory.used !== undefined) {
      const used = Number(memory.used);
      const total = Number(memory.total);
      const ratio = Number.isFinite(used) && Number.isFinite(total) && total > 0 ? used / total : undefined;
      cards.appendChild(
        buildMetricCard({
          label: "Heap used",
          value: formatBytes(memory.used),
          support: memory.total !== undefined ? `of ${formatBytes(memory.total)}` : "Heap",
          tone: ratio !== undefined && ratio >= 0.85 ? "warn" : "neutral",
          meter: ratio !== undefined ? { ratio } : undefined,
        }),
      );
    }

    renderEndpointTable(tableHost, payload.endpointStats);
  } catch {
    clearSection(cards);
    clearSection(tableHost);
    section.dataset.state = "error";
    const note = document.createElement("p");
    note.className = "metrics-error";
    note.textContent = "Could not load metrics";
    cards.appendChild(note);
  } finally {
    refresh.disabled = false;
  }
}

async function refreshEnvironment() {
  const env = document.getElementById("env-status");
  if (!env) return;
  try {
    const response = await fetch("/ready");
    if (response.status === 200) {
      env.dataset.state = "ready";
      env.textContent = "Ready";
      updateStatusStrip({ health: "Ready" });
    } else {
      env.dataset.state = "error";
      env.textContent = "Not ready";
      updateStatusStrip({ health: "Not ready" });
    }
  } catch {
    env.dataset.state = "error";
    env.textContent = "Not ready";
    updateStatusStrip({ health: "Not ready" });
  }
}

for (const item of document.querySelectorAll("[data-nav]")) {
  item.addEventListener("click", () => setView(item.getAttribute("data-nav")));
}

const navToggle = document.getElementById("nav-toggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const shell = document.getElementById("app-shell");
    const open = !shell?.classList.contains("nav-open");
    shell?.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

const THEME_KEY = "clearhouse-theme";
const DENSITY_KEY = "clearhouse-density";
const SIDEBAR_KEY = "clearhouse-sidebar";
const PRESENTATION_KEY = "clearhouse-presentation";

/**
 * @param {"noir" | "ivory" | "ember"} theme
 * @param {{ silent?: boolean }} [opts]
 */
function applyTheme(theme, opts = {}) {
  const next = theme === "ivory" ? "ivory" : theme === "ember" ? "ember" : "noir";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage unavailable — keep in-memory theme */
  }
  for (const btn of document.querySelectorAll("[data-theme-choice]")) {
    btn.setAttribute("aria-pressed", btn.getAttribute("data-theme-choice") === next ? "true" : "false");
  }
  if (!opts.silent) {
    const labels = { noir: "Zatroz Noir", ivory: "Zatroz Ivory", ember: "Zatroz Ember" };
    showToast(labels[next] || "Theme updated", "ok");
  }
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "ivory" || stored === "noir" || stored === "ember") return stored;
  } catch {
    /* ignore */
  }
  return "noir";
}

/**
 * @param {string} message
 * @param {"ok" | "warn"} [tone]
 */
function showToast(message, tone = "ok") {
  const host = document.getElementById("toast-host");
  if (!host) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.tone = tone;
  toast.textContent = message;
  host.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2200);
}

function markClientRefreshed() {
  const el = document.getElementById("strip-refreshed");
  if (!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  el.textContent = `${hh}:${mm}:${ss}`;
}

/**
 * @param {string} value
 * @param {string} successMessage
 */
async function copyText(value, successMessage) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      showToast(successMessage, "ok");
      return;
    }
  } catch {
    /* fall through */
  }
  showToast("Copy unavailable", "warn");
}

function applyAccountFilters() {
  const section = document.getElementById("accounts-view");
  const empty = document.getElementById("accounts-filter-empty");
  if (!section) return;
  const query = String(document.getElementById("accounts-search")?.value || "")
    .trim()
    .toLowerCase();
  const status = String(document.getElementById("accounts-status-filter")?.value || "all");
  const rows = [...section.querySelectorAll("[data-account-id]")];
  let visible = 0;
  for (const row of rows) {
    const id = String(row.dataset.accountId || "").toLowerCase();
    const name = String(row.querySelector(".account-name")?.textContent || "").toLowerCase();
    const rowStatus = String(row.querySelector("[data-status]")?.getAttribute("data-status") || "");
    const matchesQuery = !query || name.includes(query) || id.includes(query);
    const matchesStatus = status === "all" || rowStatus === status;
    const show = matchesQuery && matchesStatus;
    row.hidden = !show;
    if (show) visible += 1;
  }
  if (empty) {
    empty.dataset.visible = rows.length > 0 && visible === 0 ? "true" : "false";
  }
}

function applyActivityFilter() {
  const section = document.getElementById("activity-view");
  if (!section) return;
  const query = String(document.getElementById("activity-filter")?.value || "")
    .trim()
    .toLowerCase();
  for (const row of section.querySelectorAll("[data-trade]")) {
    if (!(row instanceof HTMLElement)) continue;
    if (!query) {
      row.hidden = false;
      continue;
    }
    const market = String(row.dataset.market || "").toLowerCase();
    const buy = String(row.dataset.buyAccount || "").toLowerCase();
    const sell = String(row.dataset.sellAccount || "").toLowerCase();
    const text = String(row.textContent || "").toLowerCase();
    row.hidden = !(market.includes(query) || buy.includes(query) || sell.includes(query) || text.includes(query));
  }
}

/**
 * @param {boolean} enabled
 */
function setMarketFocus(enabled) {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("focus-toggle");
  if (shell) {
    if (enabled) shell.dataset.focus = "market";
    else delete shell.dataset.focus;
  }
  if (toggle) toggle.setAttribute("aria-pressed", enabled ? "true" : "false");
}

/**
 * @param {"comfortable" | "compact"} density
 * @param {{ silent?: boolean }} [opts]
 */
function applyDensity(density, opts = {}) {
  const next = density === "compact" ? "compact" : "comfortable";
  const shell = document.getElementById("app-shell");
  if (shell) shell.dataset.density = next;
  try {
    localStorage.setItem(DENSITY_KEY, next);
  } catch {
    /* ignore */
  }
  const toggle = document.getElementById("density-toggle");
  if (toggle) toggle.setAttribute("aria-pressed", next === "compact" ? "true" : "false");
  if (!opts.silent) {
    showToast(next === "compact" ? "Compact density" : "Comfortable density", "ok");
  }
}

for (const btn of document.querySelectorAll("[data-theme-choice]")) {
  btn.addEventListener("click", () => {
    const choice = btn.getAttribute("data-theme-choice");
    applyTheme(choice === "ivory" ? "ivory" : choice === "ember" ? "ember" : "noir");
  });
}

const accountsSearch = document.getElementById("accounts-search");
const accountsStatus = document.getElementById("accounts-status-filter");
const accountsClear = document.getElementById("accounts-filter-clear");
if (accountsSearch) accountsSearch.addEventListener("input", () => applyAccountFilters());
if (accountsStatus) accountsStatus.addEventListener("change", () => applyAccountFilters());
if (accountsClear) {
  accountsClear.addEventListener("click", () => {
    if (accountsSearch) accountsSearch.value = "";
    if (accountsStatus) accountsStatus.value = "all";
    applyAccountFilters();
  });
}

const activityFilter = document.getElementById("activity-filter");
const activityClear = document.getElementById("activity-filter-clear");
if (activityFilter) activityFilter.addEventListener("input", () => applyActivityFilter());
if (activityClear) {
  activityClear.addEventListener("click", () => {
    if (activityFilter) activityFilter.value = "";
    applyActivityFilter();
  });
}

const focusToggle = document.getElementById("focus-toggle");
if (focusToggle) {
  focusToggle.addEventListener("click", () => {
    const shell = document.getElementById("app-shell");
    const enabled = shell?.dataset.focus !== "market";
    setMarketFocus(Boolean(enabled));
  });
}

const densityToggle = document.getElementById("density-toggle");
if (densityToggle) {
  densityToggle.addEventListener("click", () => {
    const shell = document.getElementById("app-shell");
    const next = shell?.dataset.density === "compact" ? "comfortable" : "compact";
    applyDensity(next);
  });
}

/**
 * @param {boolean} collapsed
 * @param {{ silent?: boolean }} [opts]
 */
function setSidebarCollapsed(collapsed, opts = {}) {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("sidebar-collapse-toggle");
  if (shell) {
    if (collapsed) shell.dataset.sidebar = "collapsed";
    else delete shell.dataset.sidebar;
  }
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded");
  } catch {
    /* ignore */
  }
  if (toggle) {
    toggle.setAttribute("aria-pressed", collapsed ? "true" : "false");
    toggle.textContent = collapsed ? "Expand" : "Collapse";
    toggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  }
  if (!opts.silent) showToast(collapsed ? "Sidebar collapsed" : "Sidebar expanded", "ok");
}

/**
 * @param {boolean} enabled
 * @param {{ silent?: boolean }} [opts]
 */
function setPresentationMode(enabled, opts = {}) {
  const shell = document.getElementById("app-shell");
  const toggle = document.getElementById("presentation-toggle");
  if (shell) {
    if (enabled) shell.dataset.presentation = "on";
    else delete shell.dataset.presentation;
  }
  try {
    localStorage.setItem(PRESENTATION_KEY, enabled ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (toggle) toggle.setAttribute("aria-pressed", enabled ? "true" : "false");
  if (enabled && shell && shell.dataset.sidebar !== "collapsed") {
    setSidebarCollapsed(true, { silent: true });
  }
  if (!opts.silent) showToast(enabled ? "Presentation mode" : "Presentation off", "ok");
}

const sidebarCollapseToggle = document.getElementById("sidebar-collapse-toggle");
if (sidebarCollapseToggle) {
  sidebarCollapseToggle.addEventListener("click", () => {
    const shell = document.getElementById("app-shell");
    setSidebarCollapsed(shell?.dataset.sidebar !== "collapsed");
  });
}

const presentationToggle = document.getElementById("presentation-toggle");
if (presentationToggle) {
  presentationToggle.addEventListener("click", () => {
    const shell = document.getElementById("app-shell");
    setPresentationMode(shell?.dataset.presentation !== "on");
  });
}

/** @type {{ id: string, label: string, run: () => void }[]} */
const PALETTE_COMMANDS = [
  { id: "overview", label: "Go to Overview", run: () => setView("overview") },
  { id: "markets", label: "Go to Markets", run: () => setView("markets") },
  { id: "accounts", label: "Go to Accounts", run: () => setView("accounts") },
  { id: "activity", label: "Go to Activity", run: () => setView("activity") },
  { id: "risk", label: "Go to Risk & Balances", run: () => setView("risk") },
  { id: "docs", label: "Open API Docs", run: () => { window.location.href = "/api/docs"; } },
  { id: "health", label: "Open System Health", run: () => setView("health") },
  { id: "metrics", label: "Open Metrics", run: () => setView("metrics") },
  { id: "theme-noir", label: "Switch to Zatroz Noir", run: () => applyTheme("noir") },
  { id: "theme-ivory", label: "Switch to Zatroz Ivory", run: () => applyTheme("ivory") },
  { id: "theme-ember", label: "Switch to Zatroz Ember", run: () => applyTheme("ember") },
  {
    id: "sidebar",
    label: "Toggle sidebar",
    run: () => {
      const shell = document.getElementById("app-shell");
      setSidebarCollapsed(shell?.dataset.sidebar !== "collapsed");
    },
  },
  {
    id: "focus",
    label: "Toggle market focus mode",
    run: () => {
      setView("markets");
      const shell = document.getElementById("app-shell");
      setMarketFocus(shell?.dataset.focus !== "market");
    },
  },
  {
    id: "present",
    label: "Toggle presentation mode",
    run: () => {
      const shell = document.getElementById("app-shell");
      setPresentationMode(shell?.dataset.presentation !== "on");
    },
  },
];

/** @type {number} */
let paletteIndex = 0;
/** @type {{ id: string, label: string, run: () => void }[]} */
let paletteVisible = [];

function closeCommandPalette() {
  const backdrop = document.getElementById("command-palette-backdrop");
  if (!backdrop) return;
  backdrop.dataset.open = "false";
  backdrop.hidden = true;
  const input = document.getElementById("command-palette-input");
  if (input instanceof HTMLInputElement) input.value = "";
}

function renderPaletteList(query) {
  const list = document.getElementById("command-palette-list");
  const empty = document.getElementById("command-palette-empty");
  if (!list) return;
  while (list.firstChild) list.removeChild(list.firstChild);
  const q = String(query || "").trim().toLowerCase();
  paletteVisible = PALETTE_COMMANDS.filter((cmd) => !q || cmd.label.toLowerCase().includes(q));
  if (paletteVisible.length === 0) {
    if (empty) empty.hidden = false;
    paletteIndex = 0;
    return;
  }
  if (empty) empty.hidden = true;
  paletteIndex = Math.min(paletteIndex, paletteVisible.length - 1);
  paletteVisible.forEach((cmd, index) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "command-palette-item";
    btn.textContent = cmd.label;
    btn.setAttribute("aria-selected", index === paletteIndex ? "true" : "false");
    btn.addEventListener("click", () => {
      closeCommandPalette();
      cmd.run();
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function openCommandPalette() {
  const backdrop = document.getElementById("command-palette-backdrop");
  const input = document.getElementById("command-palette-input");
  if (!backdrop) return;
  backdrop.hidden = false;
  backdrop.dataset.open = "true";
  paletteIndex = 0;
  renderPaletteList("");
  if (input instanceof HTMLInputElement) {
    input.focus();
    input.select();
  }
}

const paletteOpenBtn = document.getElementById("command-palette-open");
if (paletteOpenBtn) paletteOpenBtn.addEventListener("click", () => openCommandPalette());

const paletteInput = document.getElementById("command-palette-input");
if (paletteInput) {
  paletteInput.addEventListener("input", () => {
    paletteIndex = 0;
    renderPaletteList(paletteInput.value);
  });
}

const paletteBackdrop = document.getElementById("command-palette-backdrop");
if (paletteBackdrop) {
  paletteBackdrop.addEventListener("click", (event) => {
    if (event.target === paletteBackdrop) closeCommandPalette();
  });
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing =
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable);
  const paletteOpen = document.getElementById("command-palette-backdrop")?.dataset.open === "true";

  if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    if (paletteOpen) closeCommandPalette();
    else openCommandPalette();
    return;
  }

  if (paletteOpen) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCommandPalette();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (paletteVisible.length === 0) return;
      paletteIndex = (paletteIndex + 1) % paletteVisible.length;
      renderPaletteList(document.getElementById("command-palette-input")?.value || "");
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (paletteVisible.length === 0) return;
      paletteIndex = (paletteIndex - 1 + paletteVisible.length) % paletteVisible.length;
      renderPaletteList(document.getElementById("command-palette-input")?.value || "");
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const cmd = paletteVisible[paletteIndex];
      if (cmd) {
        closeCommandPalette();
        cmd.run();
      }
      return;
    }
  }

  if (event.key === "Escape") {
    const shell = document.getElementById("app-shell");
    if (shell?.classList.contains("nav-open")) {
      shell.classList.remove("nav-open");
      document.getElementById("nav-toggle")?.setAttribute("aria-expanded", "false");
      return;
    }
    if (shell?.dataset.presentation === "on") {
      setPresentationMode(false);
      return;
    }
    if (shell?.dataset.focus === "market") {
      setMarketFocus(false);
      return;
    }
  }
  if (typing) return;
  if ((event.key === "f" || event.key === "F") && document.getElementById("app-shell")?.dataset.view === "markets") {
    event.preventDefault();
    const shell = document.getElementById("app-shell");
    setMarketFocus(shell?.dataset.focus !== "market");
  }
});

applyTheme(readStoredTheme(), { silent: true });
try {
  const density = localStorage.getItem(DENSITY_KEY);
  if (density === "compact" || density === "comfortable") applyDensity(density, { silent: true });
} catch {
  /* ignore */
}
try {
  if (localStorage.getItem(SIDEBAR_KEY) === "collapsed") setSidebarCollapsed(true, { silent: true });
} catch {
  /* ignore */
}
try {
  if (localStorage.getItem(PRESENTATION_KEY) === "on") setPresentationMode(true, { silent: true });
} catch {
  /* ignore */
}

window.addEventListener("hashchange", () => {
  const view = location.hash.replace("#", "");
  if (VIEW_META[view]) setView(view);
});

const initialView = location.hash.replace("#", "");
if (VIEW_META[initialView]) setView(initialView);

void loadOverview();
void refreshEnvironment();

const feedUrl = new URLSearchParams(location.search).get("feed");
if (feedUrl) startLiveFeed(feedUrl);
