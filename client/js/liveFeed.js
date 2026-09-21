// Live-update client for the operator dashboard. See tests/challenge17.test.ts.

/**
 * @typedef {{ send(data: string): void, close(): void, onopen: (() => void) | null, onmessage: ((event: { data: string }) => void) | null, onclose: (() => void) | null }} FeedSocket
 */

/**
 * @typedef {Object} LiveFeedOptions
 * @property {string} url
 * @property {string[]} topics
 * @property {(url: string) => FeedSocket} createSocket
 * @property {(fn: () => void, ms: number) => number} setTimer
 * @property {(id: number) => void} clearTimer
 * @property {() => number} random
 * @property {(topic: string, message: { topic: string, seq: number, kind: "snapshot" | "delta", data: unknown }) => void} onMessage
 * @property {(status: "connecting" | "live" | "stale" | "reconnecting" | "stopped") => void} onStatus
 * @property {number} [staleAfterMs]
 * @property {number} [gapTimeoutMs]
 * @property {number} [baseDelayMs]
 * @property {number} [maxDelayMs]
 */

/**
 * @typedef {Object} TopicState
 * @property {number | null} lastDeliveredSeq
 * @property {boolean} hasBaseline
 * @property {Map<number, { topic: string, seq: number, kind: "snapshot" | "delta", data: unknown }>} pendingBySeq
 * @property {number | null} gapTimer
 * @property {boolean} resyncRequested
 * @property {boolean} awaitingSnapshot
 */

export class LiveFeedClient {
  /** @param {LiveFeedOptions} options */
  constructor(options) {
    this.url = options.url;
    this.topics = options.topics.slice();
    this.createSocket = options.createSocket;
    this.setTimer = options.setTimer;
    this.clearTimer = options.clearTimer;
    this.random = options.random;
    this.onMessage = options.onMessage;
    this.onStatus = options.onStatus;
    this.staleAfterMs = options.staleAfterMs ?? 5000;
    this.gapTimeoutMs = options.gapTimeoutMs ?? 1000;
    this.baseDelayMs = options.baseDelayMs ?? 500;
    this.maxDelayMs = options.maxDelayMs ?? 4000;

    /** @type {"connecting" | "live" | "stale" | "reconnecting" | "stopped" | null} */
    this.status = null;
    this.stopped = false;
    this.started = false;
    /** @type {FeedSocket | null} */
    this.socket = null;
    this.generation = 0;
    /** @type {number | null} */
    this.staleTimer = null;
    /** @type {number | null} */
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;

    /** @type {Map<string, TopicState>} */
    this.topicState = new Map();
    for (const topic of this.topics) {
      this.topicState.set(topic, this.createTopicState());
    }
  }

  /** @returns {TopicState} */
  createTopicState() {
    return {
      lastDeliveredSeq: null,
      hasBaseline: false,
      pendingBySeq: new Map(),
      gapTimer: null,
      resyncRequested: false,
      awaitingSnapshot: false,
    };
  }

  /**
   * @param {"connecting" | "live" | "stale" | "reconnecting" | "stopped"} next
   */
  setStatus(next) {
    if (this.status === next) return;
    this.status = next;
    this.onStatus(next);
  }

  start() {
    if (this.started || this.stopped) return;
    this.started = true;
    this.setStatus("connecting");
    this.openSocket();
  }

  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.clearReconnectTimer();
    this.clearStaleTimer();
    for (const topic of this.topics) {
      this.clearGapTimer(this.topicState.get(topic));
    }
    const socket = this.socket;
    this.socket = null;
    this.generation += 1;
    if (socket) {
      try {
        socket.close();
      } catch {
        // ignore close errors from already-dead sockets
      }
    }
    this.setStatus("stopped");
  }

  openSocket() {
    if (this.stopped) return;
    this.generation += 1;
    const generation = this.generation;
    let socket;
    try {
      socket = this.createSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;
    socket.onopen = () => this.handleOpen(socket, generation);
    socket.onmessage = (event) => this.handleMessage(socket, generation, event);
    socket.onclose = () => this.handleClose(socket, generation);
  }

  /**
   * @param {FeedSocket} socket
   * @param {number} generation
   */
  handleOpen(socket, generation) {
    if (this.stopped || generation !== this.generation || socket !== this.socket) return;
    /** @type {Record<string, number>} */
    const resumeFrom = {};
    for (const topic of this.topics) {
      const state = this.topicState.get(topic);
      if (state && state.lastDeliveredSeq !== null) {
        resumeFrom[topic] = state.lastDeliveredSeq;
      }
    }
    socket.send(JSON.stringify({ type: "subscribe", topics: this.topics, resumeFrom }));
    this.armStaleTimer();
  }

  /**
   * @param {FeedSocket} socket
   * @param {number} generation
   * @param {{ data: string }} event
   */
  handleMessage(socket, generation, event) {
    if (this.stopped || generation !== this.generation || socket !== this.socket) return;

    let frame;
    try {
      frame = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    if (!frame || typeof frame !== "object") return;

    if (frame.kind === "heartbeat") {
      this.noteActivity();
      return;
    }

    if (frame.kind !== "snapshot" && frame.kind !== "delta") return;
    if (typeof frame.topic !== "string" || typeof frame.seq !== "number") return;
    if (!this.topicState.has(frame.topic)) return;

    this.noteActivity();
    if (frame.kind === "snapshot") {
      this.handleSnapshot(frame);
    } else {
      this.handleDelta(frame);
    }
  }

  /**
   * @param {FeedSocket} socket
   * @param {number} generation
   */
  handleClose(socket, generation) {
    if (this.stopped || generation !== this.generation || socket !== this.socket) return;
    this.socket = null;
    this.clearStaleTimer();
    for (const topic of this.topics) {
      const state = this.topicState.get(topic);
      if (!state) continue;
      state.hasBaseline = false;
      state.awaitingSnapshot = false;
      state.resyncRequested = false;
      state.pendingBySeq.clear();
      this.clearGapTimer(state);
    }
    this.setStatus("reconnecting");
    this.scheduleReconnect();
  }

  noteActivity() {
    if (this.stopped) return;
    this.setStatus("live");
    this.reconnectAttempt = 0;
    this.armStaleTimer();
  }

  armStaleTimer() {
    this.clearStaleTimer();
    if (this.stopped || this.status === "reconnecting" || !this.socket) return;
    const generation = this.generation;
    this.staleTimer = this.setTimer(() => {
      this.staleTimer = null;
      if (this.stopped || generation !== this.generation || !this.socket) return;
      if (this.status === "reconnecting") return;
      this.setStatus("stale");
    }, this.staleAfterMs);
  }

  clearStaleTimer() {
    if (this.staleTimer !== null) {
      this.clearTimer(this.staleTimer);
      this.staleTimer = null;
    }
  }

  scheduleReconnect() {
    if (this.stopped) return;
    this.clearReconnectTimer();
    this.setStatus("reconnecting");
    const attempt = this.reconnectAttempt;
    this.reconnectAttempt += 1;
    const cap = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** attempt);
    const delay = Math.floor(cap * (0.5 + 0.5 * this.random()));
    const generation = this.generation;
    this.reconnectTimer = this.setTimer(() => {
      this.reconnectTimer = null;
      if (this.stopped || generation !== this.generation) return;
      this.openSocket();
    }, delay);
  }

  clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      this.clearTimer(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * @param {{ topic: string, seq: number, kind: "snapshot" | "delta", data: unknown }} frame
   */
  handleSnapshot(frame) {
    const state = this.topicState.get(frame.topic);
    if (!state) return;
    this.clearGapTimer(state);
    state.pendingBySeq.clear();
    state.resyncRequested = false;
    state.awaitingSnapshot = false;
    state.hasBaseline = true;
    state.lastDeliveredSeq = frame.seq;
    this.onMessage(frame.topic, frame);
    this.drainPending(frame.topic, state);
  }

  /**
   * @param {{ topic: string, seq: number, kind: "snapshot" | "delta", data: unknown }} frame
   */
  handleDelta(frame) {
    const state = this.topicState.get(frame.topic);
    if (!state) return;
    if (!state.hasBaseline || state.awaitingSnapshot) return;

    const last = state.lastDeliveredSeq;
    if (last === null) return;

    if (frame.seq <= last) return;

    if (frame.seq === last + 1) {
      this.deliverDelta(frame.topic, state, frame);
      this.drainPending(frame.topic, state);
      this.refreshGapTimer(frame.topic, state);
      return;
    }

    if (!state.pendingBySeq.has(frame.seq)) {
      state.pendingBySeq.set(frame.seq, frame);
    }
    this.refreshGapTimer(frame.topic, state);
  }

  /**
   * @param {string} topic
   * @param {TopicState} state
   * @param {{ topic: string, seq: number, kind: "snapshot" | "delta", data: unknown }} frame
   */
  deliverDelta(topic, state, frame) {
    state.lastDeliveredSeq = frame.seq;
    this.onMessage(topic, frame);
  }

  /**
   * @param {string} topic
   * @param {TopicState} state
   */
  drainPending(topic, state) {
    while (state.lastDeliveredSeq !== null) {
      const nextSeq = state.lastDeliveredSeq + 1;
      const next = state.pendingBySeq.get(nextSeq);
      if (!next) break;
      state.pendingBySeq.delete(nextSeq);
      this.deliverDelta(topic, state, next);
    }
  }

  /**
   * @param {string} topic
   * @param {TopicState} state
   */
  refreshGapTimer(topic, state) {
    const last = state.lastDeliveredSeq;
    const hasGap =
      state.hasBaseline &&
      !state.awaitingSnapshot &&
      last !== null &&
      [...state.pendingBySeq.keys()].some((seq) => seq > last + 1);

    if (!hasGap) {
      this.clearGapTimer(state);
      return;
    }
    if (state.gapTimer !== null) return;

    const generation = this.generation;
    const socket = this.socket;
    state.gapTimer = this.setTimer(() => {
      state.gapTimer = null;
      if (this.stopped || generation !== this.generation || socket !== this.socket || !this.socket) return;
      const stillGap =
        state.hasBaseline &&
        !state.awaitingSnapshot &&
        state.lastDeliveredSeq !== null &&
        [...state.pendingBySeq.keys()].some((seq) => seq > /** @type {number} */ (state.lastDeliveredSeq) + 1);
      if (!stillGap || state.resyncRequested) return;
      state.resyncRequested = true;
      state.awaitingSnapshot = true;
      state.pendingBySeq.clear();
      try {
        this.socket.send(JSON.stringify({ type: "resync", topic }));
      } catch {
        // ignore send failures on a dying socket
      }
    }, this.gapTimeoutMs);
  }

  /**
   * @param {TopicState | undefined} state
   */
  clearGapTimer(state) {
    if (!state || state.gapTimer === null) return;
    this.clearTimer(state.gapTimer);
    state.gapTimer = null;
  }
}

/**
 * Applies one order-book delta to a book without mutating it.
 * @param {{ bids: { price: string, quantity: string }[], asks: { price: string, quantity: string }[] }} book
 * @param {{ side: string, price: string, quantity: string }} delta
 * @returns {{ bids: { price: string, quantity: string }[], asks: { price: string, quantity: string }[] }}
 */
export function applyOrderBookDelta(book, delta) {
  if (!delta || typeof delta !== "object") throw new RangeError("invalid delta");
  const { side, price, quantity } = delta;
  if (side !== "bids" && side !== "asks") throw new RangeError("invalid side");
  if (typeof price !== "string" || !/^[1-9]\d*$/.test(price)) throw new RangeError("invalid price");
  if (typeof quantity !== "string" || !/^\d+$/.test(quantity)) throw new RangeError("invalid quantity");

  const normalizedQuantity = String(BigInt(quantity));

  const bids = new Map(book.bids.map((level) => [level.price, level.quantity]));
  const asks = new Map(book.asks.map((level) => [level.price, level.quantity]));
  const sideMap = side === "bids" ? bids : asks;

  if (normalizedQuantity === "0") {
    sideMap.delete(price);
  } else {
    sideMap.set(price, normalizedQuantity);
  }

  const sortSide = (entries, descending) =>
    [...entries]
      .sort((a, b) => {
        const cmp = compareIntegerStrings(a[0], b[0]);
        return descending ? -cmp : cmp;
      })
      .map(([p, q]) => ({ price: p, quantity: q }));

  return {
    bids: sortSide(bids.entries(), true),
    asks: sortSide(asks.entries(), false),
  };
}

/**
 * @param {string} a
 * @param {string} b
 */
function compareIntegerStrings(a, b) {
  if (a.length !== b.length) return a.length < b.length ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}
