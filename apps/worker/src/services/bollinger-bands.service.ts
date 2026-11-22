import { findLatestCandles } from "@trafind/database";
import { calculateBollingerBands } from "../quantative/bollinger-bands.js";

type CandleInterval = "M1" | "M5" | "H1";

interface BollingerBandsInput {
  symbol: string;
  interval: CandleInterval;
  period?: number;
  multiplier?: number;
}

export async function getBollingerBands({
  symbol,
  interval,
  period = 20,
  multiplier = 2
}: BollingerBandsInput) {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Invalid period");
  }

  const candles = await findLatestCandles(
    symbol,
    interval,
    period
  );

  if (candles.length < period) {
    throw new Error("Not enough candles");
  }

  const closes = candles.map((candle) => Number(candle.close));

  const bands = calculateBollingerBands(
    closes,
    period,
    multiplier
  );

  return bands.map((band, index) => ({
    openTime: candles[index].openTime,
    ...band
  }));
}