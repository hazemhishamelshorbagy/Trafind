/**
 * What: Fetches recent candles and calculates historical volatility.
 * Why: Exposes volatility measurements to worker and API callers.
 */
import { findLatestCandles } from "@trafind/database";
import { calculateHistoricalVolatility } from "../quantative/volatility.js";

type MarketInterval = "1m" | "5m" | "1h";

const INTERVAL_MAP = {
  "1m": "M1",
  "5m": "M5",
  "1h": "H1"
} as const;

export async function getHistoricalVolatility(
  symbol: string,
  interval: MarketInterval,
  limit: number
) {
  const candles = await findLatestCandles(
    symbol,
    INTERVAL_MAP[interval],
    limit
  );

  if (candles.length < 2) {
    throw new Error("Not enough candles to calculate volatility");
  }

  const closes = candles.map((candle) =>
    candle.close.toNumber()
  );

  return calculateHistoricalVolatility(closes);
}