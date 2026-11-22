import assert from "node:assert/strict";
import { buildBinanceKlinesUrl } from "../binance.client.js";
import { buildBinanceWebSocketUrl } from "../binance-websocket.client.js";

const spotKlinesUrl = new URL(buildBinanceKlinesUrl({
  symbol: "SOLUSDT",
  interval: "1h",
  marketType: "SPOT"
}));
assert.equal(spotKlinesUrl.hostname, "data-api.binance.vision");
assert.equal(spotKlinesUrl.pathname, "/api/v3/klines");

const futuresKlinesUrl = new URL(buildBinanceKlinesUrl({
  symbol: "SOLUSDT",
  interval: "1h",
  marketType: "USD_M_FUTURES"
}));
assert.equal(futuresKlinesUrl.hostname, "fapi.binance.com");
assert.equal(futuresKlinesUrl.pathname, "/fapi/v1/klines");

assert.equal(
  buildBinanceWebSocketUrl({
    symbol: "SOLUSDT",
    interval: "1h",
    marketType: "SPOT"
  }),
  "wss://stream.binance.com:9443/ws/solusdt@kline_1h"
);
assert.equal(
  buildBinanceWebSocketUrl({
    symbol: "SOLUSDT",
    interval: "1h",
    marketType: "USD_M_FUTURES"
  }),
  "wss://fstream.binance.com/ws/solusdt@kline_1h"
);

console.log("Binance Spot and USDⓈ-M market endpoint checks passed.");
