/** OpenAPI 3 document — paths must match tests/challenge19.test.ts OPERATIONS exactly. */

const nonnegativeIntString = {
  type: "string" as const,
  pattern: "^[0-9]+$",
  description: "Non-negative integer minor units as a decimal string",
};

const signedIntString = {
  type: "string" as const,
  pattern: "^-?[0-9]+$",
  description: "Signed integer minor units as a decimal string",
};

const ErrorEnvelope = {
  type: "object" as const,
  required: ["error"],
  properties: {
    error: {
      type: "object" as const,
      required: ["code", "details"],
      properties: {
        code: { type: "string" as const },
        details: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: { message: { type: "string" as const } },
          },
        },
      },
    },
  },
};

const Meta = { type: "object" as const, additionalProperties: true };

const Asset = {
  type: "object" as const,
  required: ["code", "name", "exponent"],
  properties: {
    code: { type: "string" as const },
    name: { type: "string" as const },
    exponent: { type: "integer" as const },
  },
  additionalProperties: false,
};

const BookLevel = {
  type: "object" as const,
  required: ["price", "quantity"],
  properties: {
    price: { type: "string" as const },
    quantity: { type: "string" as const },
  },
};

function envelope(dataSchema: Record<string, unknown>) {
  return {
    type: "object" as const,
    required: ["data", "meta"],
    properties: { data: dataSchema, meta: Meta },
  };
}

function jsonOk(description: string, schema: Record<string, unknown>, code = "200") {
  return {
    [code]: {
      description,
      content: { "application/json": { schema } },
    },
  };
}

function errors(...codes: string[]) {
  const out: Record<string, unknown> = {};
  for (const code of codes) {
    out[code] = {
      description: `Error ${code}`,
      content: {
        "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } },
      },
    };
  }
  return out;
}

function pathParam(name: string) {
  return { name, in: "path" as const, required: true, schema: { type: "string" as const } };
}

function idempotencyKey() {
  return {
    name: "Idempotency-Key",
    in: "header" as const,
    required: true,
    schema: { type: "string" as const, minLength: 1 },
  };
}

const amountBody = {
  type: "object" as const,
  required: ["accountId", "amount", "asset"],
  properties: {
    accountId: { type: "string" as const },
    asset: { type: "string" as const },
    amount: nonnegativeIntString,
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ClearHouse API",
    version: "1.0.0",
    description: "Clearing, matching and settlement HTTP API.",
  },
  servers: [{ url: "/", description: "Current host" }],
  tags: [
    { name: "Auth" },
    { name: "Assets" },
    { name: "Secure" },
    { name: "Ledger" },
    { name: "Orders" },
    { name: "Settlement" },
    { name: "Risk" },
    { name: "Events" },
    { name: "Market Data" },
    { name: "Config" },
    { name: "Operations" },
    { name: "Documentation" },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        operationId: "login",
        summary: "Issue access and refresh tokens for an account",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["accountId", "role"],
                properties: {
                  accountId: { type: "string" },
                  role: { type: "string", enum: ["admin", "operator"] },
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Authenticated session", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "503"),
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        operationId: "refreshTokens",
        summary: "Rotate a refresh token into a new token pair",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Rotated tokens", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "401"),
        },
      },
    },
    "/api/assets": {
      get: {
        operationId: "listAssets",
        summary: "List supported assets with decimal exponents",
        tags: ["Assets"],
        responses: {
          ...jsonOk("Asset list", {
            type: "object",
            required: ["data", "meta"],
            properties: {
              data: { type: "array", items: Asset },
              meta: { type: "object", additionalProperties: true },
            },
          }),
          ...errors("500"),
        },
      },
    },
    "/api/assets/validate": {
      post: {
        operationId: "validateAssetAmount",
        summary: "Validate a decimal amount for a known asset",
        tags: ["Assets"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount", "asset"],
                properties: {
                  amount: { type: "string" },
                  asset: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Parsed amount", envelope({ type: "object", additionalProperties: true })),
          ...errors("400"),
        },
      },
    },
    "/api/secure/echo": {
      post: {
        operationId: "secureEcho",
        summary: "Echo the body of an HMAC-authenticated request",
        tags: ["Secure"],
        responses: {
          ...jsonOk("Echo payload", { type: "object", additionalProperties: true }),
        },
      },
    },
    "/api/ledger/accounts": {
      get: {
        operationId: "listLedgerAccounts",
        summary: "List ledger accounts and their balance rows",
        tags: ["Ledger"],
        responses: {
          ...jsonOk("Account list", envelope({ type: "array", items: { type: "object", additionalProperties: true } })),
          ...errors("500"),
        },
      },
      post: {
        operationId: "createLedgerAccount",
        summary: "Create a ledger account with a chart-of-accounts type",
        tags: ["Ledger"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string", minLength: 1 },
                  type: {
                    type: "string",
                    enum: ["asset", "equity", "expense", "liability", "revenue"],
                  },
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Created account", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("400"),
        },
      },
    },
    "/api/ledger/accounts/{accountId}/close": {
      post: {
        operationId: "closeLedgerAccount",
        summary: "Close a zero-balance ledger account",
        tags: ["Ledger"],
        parameters: [pathParam("accountId")],
        responses: {
          ...jsonOk("Closed account", envelope({ type: "object", additionalProperties: true })),
          ...errors("403", "409"),
        },
      },
    },
    "/api/ledger/accounts/{accountId}/balance": {
      get: {
        operationId: "getLedgerAccountBalance",
        summary: "Derive one asset balance from ledger postings",
        tags: ["Ledger"],
        parameters: [
          pathParam("accountId"),
          { name: "asset", in: "query", required: true, schema: { type: "string" } },
          { name: "asOf", in: "query", required: false, schema: { type: "string" } },
          { name: "asOfEntry", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: {
          ...jsonOk("Balance", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "403"),
        },
      },
    },
    "/api/ledger/accounts/{accountId}/statement": {
      get: {
        operationId: "getLedgerAccountStatement",
        summary: "Page ledger postings for one account",
        tags: ["Ledger"],
        parameters: [
          pathParam("accountId"),
          { name: "limit", in: "query", required: false, schema: { type: "integer" } },
          { name: "cursor", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: {
          ...jsonOk("Statement", envelope({ type: "array", items: { type: "object", additionalProperties: true } })),
          ...errors("403"),
        },
      },
    },
    "/api/ledger/entries": {
      post: {
        operationId: "createLedgerEntry",
        summary: "Post a balanced multi-leg ledger entry",
        tags: ["Ledger"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["postings"],
                properties: {
                  postings: {
                    type: "array",
                    minItems: 2,
                    items: {
                      type: "object",
                      required: ["accountId", "asset", "amount"],
                      properties: {
                        accountId: { type: "string" },
                        asset: { type: "string" },
                        amount: signedIntString,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Entry created", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("400", "422"),
        },
      },
    },
    "/api/ledger/entries/{entryId}/reverse": {
      post: {
        operationId: "reverseLedgerEntry",
        summary: "Post reversing legs for an existing ledger entry",
        tags: ["Ledger"],
        parameters: [pathParam("entryId")],
        responses: {
          ...jsonOk("Reversal created", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("404"),
        },
      },
    },
    "/api/ledger/trial-balance": {
      get: {
        operationId: "getTrialBalance",
        summary: "Sum postings by asset for a trial balance",
        tags: ["Ledger"],
        responses: {
          ...jsonOk("Trial balance", envelope({ type: "object", additionalProperties: true })),
          ...errors("500"),
        },
      },
    },
    "/api/orders": {
      post: {
        operationId: "placeOrder",
        summary: "Place a new order on the matching engine",
        tags: ["Orders"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["accountId", "market", "quantity", "side"],
                properties: {
                  accountId: { type: "string" },
                  market: { type: "string" },
                  side: { type: "string", enum: ["buy", "sell"] },
                  quantity: nonnegativeIntString,
                  price: nonnegativeIntString,
                  timeInForce: { type: "string", enum: ["FOK", "GTC", "IOC", "POST_ONLY"] },
                  orderType: { type: "string", enum: ["limit", "market", "stop", "stop_limit"] },
                  stopPrice: nonnegativeIntString,
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Order accepted", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("400", "409"),
        },
      },
    },
    "/api/orders/{orderId}": {
      delete: {
        operationId: "cancelOrder",
        summary: "Cancel a resting order by id",
        tags: ["Orders"],
        parameters: [pathParam("orderId")],
        responses: {
          ...jsonOk("Cancel result", envelope({ type: "object", additionalProperties: true })),
          ...errors("404"),
        },
      },
      patch: {
        operationId: "amendOrder",
        summary: "Amend price or quantity on a resting order",
        tags: ["Orders"],
        parameters: [pathParam("orderId")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  price: nonnegativeIntString,
                  quantity: nonnegativeIntString,
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Amended order", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "404", "409"),
        },
      },
    },
    "/api/orders/trades": {
      get: {
        operationId: "listRecentTrades",
        summary: "List recent trades from the matching engine",
        tags: ["Orders"],
        parameters: [{ name: "limit", in: "query", required: false, schema: { type: "integer" } }],
        responses: {
          ...jsonOk("Trades", envelope({ type: "array", items: { type: "object", additionalProperties: true } })),
          ...errors("500"),
        },
      },
    },
    "/api/orders/book/{market}": {
      get: {
        operationId: "getBestPrices",
        summary: "Read best bid and ask for a market",
        tags: ["Orders"],
        parameters: [pathParam("market")],
        responses: {
          ...jsonOk("Best prices", envelope({ type: "object", additionalProperties: true })),
          ...errors("500"),
        },
      },
    },
    "/api/orders/book/{market}/depth": {
      get: {
        operationId: "getBookDepth",
        summary: "Read aggregated bid and ask depth for a market",
        tags: ["Orders"],
        parameters: [pathParam("market")],
        responses: {
          ...jsonOk("Depth ladder", {
            type: "object",
            required: ["data", "meta"],
            properties: {
              data: {
                type: "object",
                required: ["bids", "asks"],
                properties: {
                  bids: { type: "array", items: BookLevel },
                  asks: { type: "array", items: BookLevel },
                },
              },
              meta: Meta,
            },
          }),
          ...errors("500"),
        },
      },
    },
    "/api/settlement/accounts/{accountId}/balance": {
      get: {
        operationId: "getSettlementBalance",
        summary: "Read available and held settlement balances",
        tags: ["Settlement"],
        parameters: [
          pathParam("accountId"),
          { name: "asset", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          ...jsonOk("Settlement balance", envelope({ type: "object", additionalProperties: true })),
          ...errors("400"),
        },
      },
    },
    "/api/settlement/holds": {
      post: {
        operationId: "createSettlementHold",
        summary: "Move available funds into the held bucket",
        tags: ["Settlement"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: amountBody } },
        },
        responses: {
          ...jsonOk("Hold applied", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "409"),
        },
      },
    },
    "/api/settlement/releases": {
      post: {
        operationId: "releaseSettlementHold",
        summary: "Release held funds back to available",
        tags: ["Settlement"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: amountBody } },
        },
        responses: {
          ...jsonOk("Hold released", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "409"),
        },
      },
    },
    "/api/settlement/deposits": {
      post: {
        operationId: "depositFunds",
        summary: "Credit available balance with an idempotent deposit",
        tags: ["Settlement"],
        parameters: [idempotencyKey()],
        requestBody: {
          required: true,
          content: { "application/json": { schema: amountBody } },
        },
        responses: {
          ...jsonOk("Deposit applied", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "409"),
        },
      },
    },
    "/api/settlement/withdrawals": {
      post: {
        operationId: "withdrawFunds",
        summary: "Debit available balance with an idempotent withdrawal",
        tags: ["Settlement"],
        parameters: [idempotencyKey()],
        requestBody: {
          required: true,
          content: { "application/json": { schema: amountBody } },
        },
        responses: {
          ...jsonOk("Withdrawal applied", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "409"),
        },
      },
    },
    "/api/settlement/trades": {
      post: {
        operationId: "settleTrade",
        summary: "Settle an asset-versus-cash trade between accounts",
        tags: ["Settlement"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "sellerAssetAccountId",
                  "buyerAssetAccountId",
                  "asset",
                  "quantity",
                  "buyerCashAccountId",
                  "sellerCashAccountId",
                  "cashAsset",
                  "cashAmount",
                ],
                properties: {
                  sellerAssetAccountId: { type: "string" },
                  buyerAssetAccountId: { type: "string" },
                  asset: { type: "string" },
                  quantity: nonnegativeIntString,
                  buyerCashAccountId: { type: "string" },
                  sellerCashAccountId: { type: "string" },
                  cashAsset: { type: "string" },
                  cashAmount: nonnegativeIntString,
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Trade settled", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("400", "409"),
        },
      },
    },
    "/api/risk/limits": {
      post: {
        operationId: "setRiskLimits",
        summary: "Set pre-trade risk limits for an account",
        tags: ["Risk"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["accountId", "maxNotional", "maxOpenOrders", "maxPositionAbs"],
                properties: {
                  accountId: { type: "string" },
                  maxNotional: nonnegativeIntString,
                  maxOpenOrders: { type: "integer", minimum: 0 },
                  maxPositionAbs: nonnegativeIntString,
                },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Limits stored", envelope({ type: "object", additionalProperties: true })),
          ...errors("400"),
        },
      },
    },
    "/api/risk/accounts/{accountId}/state": {
      get: {
        operationId: "getRiskAccountState",
        summary: "Read risk utilisation and limits for an account",
        tags: ["Risk"],
        parameters: [pathParam("accountId")],
        responses: {
          ...jsonOk("Risk state", envelope({ type: "object", additionalProperties: true })),
          ...errors("500"),
        },
      },
    },
    "/api/risk/kill-switch": {
      post: {
        operationId: "setKillSwitch",
        summary: "Engage or clear the global trading kill switch",
        tags: ["Risk"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["engaged"],
                properties: { engaged: { type: "boolean" } },
              },
            },
          },
        },
        responses: {
          ...jsonOk("Kill switch state", envelope({ type: "object", additionalProperties: true })),
          ...errors("400", "403"),
        },
      },
    },
    "/api/events/deposits": {
      post: {
        operationId: "recordDepositEvent",
        summary: "Append a deposit event to the durable event log",
        tags: ["Events"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
        responses: {
          ...jsonOk("Event appended", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("400"),
        },
      },
    },
    "/api/events/rebuild": {
      get: {
        operationId: "rebuildEventProjection",
        summary: "Rebuild projected balances from the event log",
        tags: ["Events"],
        responses: {
          ...jsonOk("Rebuild complete", envelope({ type: "object", additionalProperties: true })),
          ...errors("500"),
        },
      },
    },
    "/api/events/snapshots": {
      post: {
        operationId: "createEventSnapshot",
        summary: "Persist a projection snapshot checkpoint",
        tags: ["Events"],
        responses: {
          ...jsonOk("Snapshot saved", envelope({ type: "object", additionalProperties: true }), "201"),
          ...errors("400"),
        },
      },
    },
    "/api/events/state": {
      get: {
        operationId: "getEventProjectionState",
        summary: "Read projected balances at a sequence cursor",
        tags: ["Events"],
        responses: {
          ...jsonOk("Projection state", envelope({ type: "object", additionalProperties: true })),
          ...errors("400"),
        },
      },
    },
    "/api/events/verify": {
      get: {
        operationId: "verifyEventHashChain",
        summary: "Verify the hash chain of recorded events",
        tags: ["Events"],
        responses: {
          ...jsonOk("Verification result", envelope({ type: "object", additionalProperties: true })),
          ...errors("500"),
        },
      },
    },
    "/api/market-data/candles": {
      post: {
        operationId: "aggregateCandles",
        summary: "Aggregate trades into OHLCV candles",
        tags: ["Market Data"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
        responses: {
          ...jsonOk("Candles", envelope({ type: "array", items: { type: "object", additionalProperties: true } })),
          ...errors("400"),
        },
      },
    },
    "/api/market-data/vwap": {
      post: {
        operationId: "computeVwap",
        summary: "Compute volume-weighted average price for trades",
        tags: ["Market Data"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
        responses: {
          ...jsonOk("VWAP result", envelope({ type: "object", additionalProperties: true })),
          ...errors("400"),
        },
      },
    },
    "/api/config/{key}": {
      get: {
        operationId: "getConfig",
        summary: "Read a configuration value by key",
        tags: ["Config"],
        parameters: [pathParam("key")],
        responses: {
          ...jsonOk("Config value", envelope({ type: "object", additionalProperties: true })),
          ...errors("404"),
        },
      },
      put: {
        operationId: "putConfig",
        summary: "Create or replace a configuration value",
        tags: ["Config"],
        parameters: [pathParam("key")],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
        responses: {
          ...jsonOk("Config saved", envelope({ type: "object", additionalProperties: true })),
          ...errors("400"),
        },
      },
    },
    "/health": {
      get: {
        operationId: "getHealth",
        summary: "Process liveness probe",
        tags: ["Operations"],
        responses: {
          ...jsonOk("Alive", envelope({ type: "object", additionalProperties: true })),
        },
      },
    },
    "/ready": {
      get: {
        operationId: "getReady",
        summary: "Readiness probe including database connectivity",
        tags: ["Operations"],
        responses: {
          ...jsonOk("Ready", envelope({ type: "object", additionalProperties: true })),
          "503": {
            description: "Not ready",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
          },
        },
      },
    },
    "/api/metrics": {
      get: {
        operationId: "getMetrics",
        summary: "Return process and HTTP metrics snapshot",
        tags: ["Operations"],
        responses: {
          ...jsonOk("Metrics", envelope({ type: "object", additionalProperties: true })),
          ...errors("500"),
        },
      },
    },
    "/api/openapi.json": {
      get: {
        operationId: "getOpenApiDocument",
        summary: "Download this OpenAPI description document",
        tags: ["Documentation"],
        responses: {
          ...jsonOk("OpenAPI document", { type: "object", additionalProperties: true }),
        },
      },
    },
    "/api/docs": {
      get: {
        operationId: "getSwaggerUi",
        summary: "Serve the interactive Swagger UI page",
        tags: ["Documentation"],
        responses: {
          "200": {
            description: "Swagger UI HTML",
            content: { "text/html": { schema: { type: "string" } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ErrorEnvelope,
      Asset,
      BookLevel,
    },
  },
};
