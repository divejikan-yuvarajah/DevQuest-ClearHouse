import type { Request, Response } from "express";
import { openApiDocument } from "../openapi/document.js";

const DOCS_CSP = [
  "default-src 'none'",
  "script-src https://unpkg.com 'unsafe-inline'",
  "style-src https://unpkg.com 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "font-src https://unpkg.com",
].join("; ");

const docsVersion = String(openApiDocument.info.version);
const docsTitle = String(openApiDocument.info.title);

function swaggerHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${docsTitle} Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    :root {
      --ch-bg: #070707;
      --ch-surface: #111113;
      --ch-surface-2: #171719;
      --ch-text: #f7f5f2;
      --ch-muted: #787570;
      --ch-border: rgba(247, 245, 242, 0.11);
      --ch-orange: #ff3b10;
      --ch-label: #ff3b10;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif;
      color: var(--ch-text);
      background-color: var(--ch-bg);
      background-image:
        radial-gradient(circle at 88% 0%, rgba(255, 59, 16, 0.07), transparent 42%),
        linear-gradient(rgba(247, 245, 242, 0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(247, 245, 242, 0.018) 1px, transparent 1px);
      background-size: auto, 48px 48px, 48px 48px;
    }
    .ch-docs-header {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      justify-content: space-between;
      gap: 0.85rem 1.25rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--ch-border);
      background: rgba(11, 11, 12, 0.94);
    }
    .ch-docs-kicker {
      margin: 0;
      color: var(--ch-label);
      font-size: 0.64rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .ch-docs-header h1 {
      margin: 0.35rem 0 0;
      font-size: clamp(1.15rem, 2.2vw, 1.55rem);
      font-weight: 750;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .ch-docs-sub {
      margin: 0.35rem 0 0;
      color: var(--ch-muted);
      font-size: 0.86rem;
    }
    .ch-docs-meta {
      margin: 0.45rem 0 0;
      color: var(--ch-muted);
      font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
      font-size: 0.72rem;
      font-weight: 650;
    }
    .ch-docs-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      align-items: center;
    }
    .ch-docs-actions a {
      display: inline-flex;
      align-items: center;
      min-height: 2.15rem;
      padding: 0.35rem 0.85rem;
      border: 1px solid var(--ch-border);
      border-radius: 8px;
      background: var(--ch-surface);
      color: var(--ch-text);
      font-size: 0.78rem;
      font-weight: 650;
      text-decoration: none;
    }
    .ch-docs-actions a:hover {
      border-color: rgba(255, 59, 16, 0.34);
      background: rgba(255, 59, 16, 0.1);
    }
    .ch-docs-actions a:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 59, 16, 0.22);
    }
    .ch-docs-shell {
      width: min(1180px, calc(100% - 2rem));
      margin: 1rem auto 2rem;
      padding: 0.35rem 0.35rem 1rem;
      border: 1px solid var(--ch-border);
      border-radius: 12px;
      background: var(--ch-surface);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
      overflow: hidden;
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { font-family: inherit; }
    .swagger-ui .scheme-container {
      background: transparent;
      box-shadow: none;
    }
  </style>
</head>
<body>
  <header class="ch-docs-header">
    <div>
      <p class="ch-docs-kicker">ClearHouse API</p>
      <h1>Trading, clearing and operational interfaces</h1>
      <p class="ch-docs-sub">${docsTitle}</p>
      <p class="ch-docs-meta">OpenAPI ${docsVersion}</p>
    </div>
    <div class="ch-docs-actions">
      <a href="/">Operator dashboard</a>
      <a href="/api/openapi.json">openapi.json</a>
    </div>
  </header>
  <main class="ch-docs-shell">
    <div id="swagger-ui"></div>
  </main>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/openapi.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>
`;
}

const openapi = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(openApiDocument);
};

const ui = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Security-Policy", DOCS_CSP);
  res.status(200).type("html").send(swaggerHtml());
};

export default { openapi, ui };
