/**
 * Competition demo launcher.
 * Sets CLEARHOUSE_DEMO_MARKET=1 then starts the normal ClearHouse server,
 * which bootstraps a real BTC-USD book + trades through the matching engine.
 *
 * Prerequisite: `npm run migrate` then `npm run seed`
 * Usage: `npm run demo-market`
 */
process.env.CLEARHOUSE_DEMO_MARKET = "1";
await import("../src/server.ts");
