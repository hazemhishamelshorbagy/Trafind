/**
 * What: Fetches recent candles and calculates the latest ATR value.
 * Why: Exposes volatility measurements to worker and API callers.
 */
import { findLatestCandles } from "@trafind/database";
import { calculateCandleATR } from "../quantative/atr.js";

type MarketInterval = "1m" | "5m" | "1h";

const INTERVAL_MAP = {
  "1m": "M1",
  "5m": "M5",
  "1h": "H1"
} as const;

export async function getATR(
  symbol: string,
  interval: MarketInterval,
  period: number
) {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Invalid ATR period");
  }

  const candles = await findLatestCandles(
    symbol,
    INTERVAL_MAP[interval],
    period + 1
  );

  if (candles.length < period + 1) {
    throw new Error("Not enough candles");
  }

  const input = candles.map((candle) => ({
    high: candle.high.toNumber(),
    low: candle.low.toNumber(),
    close: candle.close.toNumber()
  }));

  const values = calculateCandleATR(input, period);

 const atr = values[values.length - 1];
const latestClose = input[input.length - 1].close;

const atrPercent = (atr / latestClose) * 100;

return {
  symbol,
  interval,
  period,
  atr,
  atrPercent
};
}