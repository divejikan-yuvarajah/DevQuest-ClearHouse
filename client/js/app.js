import { renderBalance, renderOrderBook, renderRiskState, renderRiskUsage, renderAccountList, renderPortfolioSummary, renderRecentTrades, setStatus, setConnectionStatus, buildSignedRequestInit } from "./dashboard.js";
import { LiveFeedClient, applyOrderBookDelta } from "./liveFeed.js";
import { createHmacSigner } from "./signer.js";

let secret = "";
let accountId = "";
let accessToken = "";
/** @type {LiveFeedClient | null} */
let liveFeed = null;

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
}

async function getJson(path) {
  const response = await fetch(path);
  if (response.status !== 200) throw new Error(path);
  return (await response.json()).data;
}

async function loadOverview() {
  setStatus(document, "accounts-view", "loading", "Loading accounts…");
  setStatus(document, "summary-view", "loading", "Loading summary…");
  try {
    const [assets, accounts] = await Promise.all([getJson("/api/assets"), getJson("/api/ledger/accounts")]);
    renderPortfolioSummary(document, accounts, assets);
    renderAccountList(document, accounts, assets);
  } catch {
    setStatus(document, "accounts-view", "error", "Could not load accounts");
    setStatus(document, "summary-view", "error", "Could not load the portfolio summary");
  }
  try {
    renderRecentTrades(document, await getJson("/api/orders/trades?limit=10"));
  } catch {
    setStatus(document, "activity-view", "error", "Could not load recent trades");
  }
}

document.getElementById("accounts-view").addEventListener("click", (event) => {
  const row = event.target.closest("[data-account-id]");
  if (row) document.getElementById("login-account-id").value = row.dataset.accountId;
});

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
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
        return;
      }
      accessToken = payload.data.accessToken;
      await refresh(market);
      await loadOverview();
    } catch {
      setStatus(document, "balance-view", "error", "Sign-in failed");
    }
  })();
});

document.getElementById("controls-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const market = document.getElementById("market-input").value;
  void refresh(market);
  void loadOverview();
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

void loadOverview();

const feedUrl = new URLSearchParams(location.search).get("feed");
if (feedUrl) startLiveFeed(feedUrl);
