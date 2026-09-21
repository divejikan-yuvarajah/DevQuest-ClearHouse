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

const SWAGGER_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ClearHouse API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
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

const openapi = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(openApiDocument);
};

const ui = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Security-Policy", DOCS_CSP);
  res.status(200).type("html").send(SWAGGER_HTML);
};

export default { openapi, ui };
