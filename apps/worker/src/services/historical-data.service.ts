import {
  collectHistoricalKlines
} from "../collectors/historical-data.collector.js";

import {
  mapBinanceKline
} from "../mappers/binance.mapper.js";
import { BinanceInterval } from "../types/market.types.js";

import {
  validateCandle,
  isCandleClosed
} from "../validators/candle.validator.js";

import {
  saveMany,
  findLatest
} from "@trafind/database";


interface HistoricalDataParams {
  symbol: string;
  interval: BinanceInterval;
  startTime: number;
  endTime: number;
}

const INTERVAL_MAP = {
  "1m": "M1",
  "5m": "M5",
  "1h": "H1"
} as const;
const INTERVAL_DURATION: Record<BinanceInterval, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "1h": 3_600_000
};
export async function collectAndSaveHistoricalData({
  symbol,
  interval,
  startTime,
  endTime
}: HistoricalDataParams) {
  let totalReceived = 0;
  let totalValid = 0;
  let totalSaved = 0;
  let totalSkipped = 0;
const dbInterval = INTERVAL_MAP[interval];

const latestCandle = await findLatest(symbol, dbInterval);

const nextStartTime = latestCandle
  ? latestCandle.openTime.getTime() + INTERVAL_DURATION[interval]
  : startTime;

const effectiveStartTime = Math.max(startTime, nextStartTime);
  for await (const batch of collectHistoricalKlines({
    symbol,
    interval,
    startTime: effectiveStartTime,
    endTime
  })) {
    totalReceived += batch.length;

    const mappedCandles = batch.map((kline) =>
      mapBinanceKline(kline, symbol, interval)
    );

    const validCandles = mappedCandles.filter(
      (candle) =>
        validateCandle(candle) && isCandleClosed(candle)
    );

    totalValid += validCandles.length;
    totalSkipped += batch.length - validCandles.length;

    const databaseCandles = validCandles.map((candle) => ({
      ...candle,
      interval: INTERVAL_MAP[candle.interval]
    }));

    const saved = await saveMany(databaseCandles);

    totalSaved += saved;

    console.log({
      received: batch.length,
      valid: validCandles.length,
      saved,
      skipped: batch.length - validCandles.length
    });
  }

  return {
    totalReceived,
    totalValid,
    totalSaved,
    totalSkipped
  };
}