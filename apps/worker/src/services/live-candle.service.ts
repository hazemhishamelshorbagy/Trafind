import {
  mapWebSocketMessageToKline,
} from "../mappers/binance-websocket.mapper.js";

import { mapBinanceKline } from "../mappers/binance.mapper.js";
import { BinanceWebSocketMessage } from "../types/market.types.js";

import {
  validateCandle
} from "../validators/candle.validator.js";

import { saveMany } from "@trafind/database";

const INTERVAL_MAP = {
  "1m": "M1",
  "5m": "M5",
  "1h": "H1"
} as const;

export async function processLiveCandle(
  message: BinanceWebSocketMessage
) {
  // Ignore updates until the candle is closed.
  if (!message.k.x) return;

  const kline = mapWebSocketMessageToKline(message);

  const candle = mapBinanceKline(
    kline,
    message.s,
    message.k.i
  );

  if (!validateCandle(candle)) {
    console.warn("Invalid candle received:", candle);
    return;
  }

  const databaseCandle = {
    ...candle,
    interval: INTERVAL_MAP[candle.interval]
  };

  const saved = await saveMany([databaseCandle]);

  console.log("Closed candle processed:", {
    symbol: candle.symbol,
    interval: candle.interval,
    openTime: candle.openTime.toISOString(),
    close: candle.close,
    saved
  });
}