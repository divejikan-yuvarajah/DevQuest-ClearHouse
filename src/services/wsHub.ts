import type { IncomingMessage, Server } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocket, WebSocketServer, type RawData } from "ws";

export interface HubPrincipal {
  accountId: string;
  role: "operator" | "admin";
}

export interface HubOptions {
  server: Server;
  path: string;
  authenticate: (token: string | undefined) => HubPrincipal | null;
  authorize: (principal: HubPrincipal, topic: string) => "ok" | "forbidden" | "unknown";
  snapshot: (topic: string) => unknown;
  heartbeatIntervalMs?: number;
  maxBufferedBytes?: number;
}

interface ClientState {
  socket: WebSocket;
  principal: HubPrincipal;
  topics: Set<string>;
  isAlive: boolean;
  /** True while a deferred over-budget eviction check is queued. */
  pendingEvict: boolean;
}

interface TopicState {
  seq: number;
  subscribers: Set<ClientState>;
}

const DEFAULT_HEARTBEAT_MS = 30_000;
const DEFAULT_MAX_BUFFERED = 256 * 1024;

function rawToString(data: RawData): string | null {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return null;
}

function sendJson(socket: WebSocket, value: unknown): void {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(value));
}

function writeHttp401(socket: Duplex): void {
  socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
  socket.destroy();
}

function tokenFromRequest(req: IncomingMessage): string | undefined {
  try {
    const host = req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    const queryToken = url.searchParams.get("token");
    if (queryToken !== null && queryToken.length > 0) return queryToken;
  } catch {
    /* fall through */
  }
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (token.length > 0) return token;
  }
  return undefined;
}

function pathMatches(req: IncomingMessage, expectedPath: string): boolean {
  try {
    const host = req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    return url.pathname === expectedPath;
  } catch {
    return false;
  }
}

/** A WebSocket hub that streams topics to authenticated clients. See tests/challenge18.test.ts. */
export class WebSocketHub {
  private readonly options: HubOptions & {
    heartbeatIntervalMs: number;
    maxBufferedBytes: number;
  };
  private readonly wss: WebSocketServer;
  private readonly clients = new Set<ClientState>();
  private readonly topics = new Map<string, TopicState>();
  private readonly heartbeatTimer: ReturnType<typeof setInterval>;
  private readonly onUpgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void;
  private closed = false;

  constructor(options: HubOptions) {
    this.options = {
      ...options,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS,
      maxBufferedBytes: options.maxBufferedBytes ?? DEFAULT_MAX_BUFFERED,
    };

    this.wss = new WebSocketServer({ noServer: true });

    this.onUpgrade = (req, socket, head) => {
      if (this.closed) {
        socket.destroy();
        return;
      }
      if (!pathMatches(req, this.options.path)) return;

      const principal = this.options.authenticate(tokenFromRequest(req));
      if (!principal) {
        writeHttp401(socket);
        return;
      }

      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.acceptClient(ws, principal);
      });
    };

    this.options.server.on("upgrade", this.onUpgrade);

    this.heartbeatTimer = setInterval(() => this.heartbeatTick(), this.options.heartbeatIntervalMs);
    this.heartbeatTimer.unref?.();
  }

  publish(topic: string, data: unknown): number {
    if (this.closed) return this.topicState(topic).seq;

    const state = this.topicState(topic);
    state.seq += 1;
    const seq = state.seq;
    const serialized = JSON.stringify({ topic, seq, kind: "delta", data });

    for (const client of [...state.subscribers]) {
      this.sendSerialized(client, serialized);
    }
    return seq;
  }

  disconnectAll(_code?: number): void {
    for (const client of [...this.clients]) {
      this.dropClient(client, 1012);
    }
  }

  connectionCount(): number {
    return this.clients.size;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    clearInterval(this.heartbeatTimer);
    this.options.server.off("upgrade", this.onUpgrade);

    for (const client of [...this.clients]) {
      this.dropClient(client, 1001);
    }

    await new Promise<void>((resolve) => {
      this.wss.close(() => resolve());
    });
  }

  private topicState(topic: string): TopicState {
    let state = this.topics.get(topic);
    if (!state) {
      state = { seq: 0, subscribers: new Set() };
      this.topics.set(topic, state);
    }
    return state;
  }

  private acceptClient(socket: WebSocket, principal: HubPrincipal): void {
    const client: ClientState = {
      socket,
      principal,
      topics: new Set(),
      isAlive: true,
      pendingEvict: false,
    };
    this.clients.add(client);

    socket.on("pong", () => {
      client.isAlive = true;
    });

    socket.on("message", (data) => {
      this.onMessage(client, data);
    });

    const cleanup = () => {
      this.removeClient(client);
    };
    socket.on("close", cleanup);
    socket.on("error", cleanup);
  }

  private onMessage(client: ClientState, data: RawData): void {
    const text = rawToString(data);
    if (text === null) {
      sendJson(client.socket, { type: "error", code: "BAD_MESSAGE" });
      return;
    }

    let message: unknown;
    try {
      message = JSON.parse(text);
    } catch {
      sendJson(client.socket, { type: "error", code: "BAD_MESSAGE" });
      return;
    }

    if (!message || typeof message !== "object") {
      sendJson(client.socket, { type: "error", code: "BAD_MESSAGE" });
      return;
    }

    const body = message as Record<string, unknown>;
    if (body.type === "subscribe") {
      this.handleSubscribe(client, body);
      return;
    }
    if (body.type === "resync") {
      this.handleResync(client, body);
      return;
    }
    sendJson(client.socket, { type: "error", code: "BAD_MESSAGE" });
  }

  private handleSubscribe(client: ClientState, body: Record<string, unknown>): void {
    const topics = body.topics;
    if (!Array.isArray(topics) || !topics.every((t) => typeof t === "string")) {
      sendJson(client.socket, { type: "error", code: "BAD_MESSAGE" });
      return;
    }

    const accepted: string[] = [];
    for (const topic of topics) {
      const decision = this.options.authorize(client.principal, topic);
      if (decision === "forbidden") {
        sendJson(client.socket, { type: "error", code: "FORBIDDEN", topic });
        continue;
      }
      if (decision === "unknown") {
        sendJson(client.socket, { type: "error", code: "UNKNOWN_TOPIC", topic });
        continue;
      }

      // Snapshot + seq observation + subscriber activation must stay synchronous.
      const state = this.topicState(topic);
      const seq = state.seq;
      const data = this.options.snapshot(topic);
      state.subscribers.add(client);
      client.topics.add(topic);
      accepted.push(topic);
      sendJson(client.socket, { topic, seq, kind: "snapshot", data });
    }

    if (accepted.length > 0) {
      sendJson(client.socket, { type: "subscribed", topics: accepted });
    }
  }

  private handleResync(client: ClientState, body: Record<string, unknown>): void {
    const topic = body.topic;
    if (typeof topic !== "string") {
      sendJson(client.socket, { type: "error", code: "BAD_MESSAGE" });
      return;
    }
    if (!client.topics.has(topic)) {
      sendJson(client.socket, { type: "error", code: "NOT_SUBSCRIBED", topic });
      return;
    }

    const state = this.topicState(topic);
    const seq = state.seq;
    const data = this.options.snapshot(topic);
    sendJson(client.socket, { topic, seq, kind: "snapshot", data });
  }

  private sendSerialized(client: ClientState, serialized: string): void {
    const socket = client.socket;
    if (socket.readyState !== WebSocket.OPEN) {
      this.removeClient(client);
      return;
    }
    try {
      socket.send(serialized);
    } catch {
      this.dropClient(client);
      return;
    }
    // Defer eviction until after the current sync burst yields. Healthy clients drain on
    // the next turn; paused clients remain over budget and are terminated.
    this.scheduleBackpressureCheck(client);
  }

  private scheduleBackpressureCheck(client: ClientState): void {
    if (client.pendingEvict || !this.clients.has(client)) return;
    const socket = client.socket;
    if (socket.bufferedAmount <= this.options.maxBufferedBytes) return;
    client.pendingEvict = true;
    setImmediate(() => {
      client.pendingEvict = false;
      if (!this.clients.has(client)) return;
      if (client.socket.readyState !== WebSocket.OPEN) {
        this.removeClient(client);
        return;
      }
      if (client.socket.bufferedAmount > this.options.maxBufferedBytes) {
        this.dropClient(client);
      }
    });
  }

  private heartbeatTick(): void {
    if (this.closed) return;
    const heartbeatFrame = JSON.stringify({ kind: "heartbeat" });
    for (const client of [...this.clients]) {
      if (!client.isAlive) {
        this.dropClient(client);
        continue;
      }
      client.isAlive = false;
      if (client.socket.readyState !== WebSocket.OPEN) {
        this.removeClient(client);
        continue;
      }
      try {
        this.scheduleBackpressureCheck(client);
        if (!this.clients.has(client)) continue;
        client.socket.send(heartbeatFrame);
        client.socket.ping();
      } catch {
        this.dropClient(client);
      }
    }
  }

  private dropClient(client: ClientState, code?: number): void {
    if (!this.clients.has(client)) return;
    this.removeClient(client);
    const socket = client.socket;
    try {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        if (code !== undefined) socket.close(code);
        else socket.terminate();
      }
    } catch {
      try {
        socket.terminate();
      } catch {
        /* ignore */
      }
    }
  }

  private removeClient(client: ClientState): void {
    if (!this.clients.delete(client)) return;
    for (const topic of client.topics) {
      this.topics.get(topic)?.subscribers.delete(client);
    }
    client.topics.clear();
  }
}
