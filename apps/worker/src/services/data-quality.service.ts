/**
 * What: Detects missing, duplicate, unsorted, trailing, and range candle times.
 * Why: Provides the quality measurements needed to decide whether data repair is necessary.
 */
import { findCandleOpenTimes } from "@trafind/database";
import {
  BinanceInterval,
  BinanceMarketType
} from "../types/market.types.js";
export function detectMissingCandles(
  openTimes: Date[],
  intervalDuration: number,
): Date[] {
  const missing: Date[] = [];

  for (let i = 1; i < openTimes.length; i++) {
    let expectedTime = openTimes[i - 1].getTime() + intervalDuration;

    const nextTime = openTimes[i].getTime();

    while (expectedTime < nextTime) {
      missing.push(new Date(expectedTime));
      expectedTime += intervalDuration;
    }
  }

  return missing;
}

export function areCandleTimesSorted(openTimes: Date[]): boolean {
  for (let i = 1; i < openTimes.length; i++) {
    if (openTimes[i].getTime() <= openTimes[i - 1].getTime()) {
      return false;
    }
  }

  return true;
}

export function areCandleDatesValid(openTimes: Date[]): boolean {
  return openTimes.every(
    (date) => date instanceof Date && Number.isFinite(date.getTime()),
  );
}

export function checkCandleData(
  openTimes: Date[],
  intervalDuration: number,
): Date[] {
  if (!areCandleDatesValid(openTimes)) {
    throw new Error("Invalid candle dates");
  }

  if (!areCandleTimesSorted(openTimes)) {
    throw new Error("Candle times are not sorted or contain duplicates");
  }

  if (!Number.isFinite(intervalDuration) || intervalDuration <= 0) {
    throw new Error("Invalid interval duration");
  }

  return detectMissingCandles(openTimes, intervalDuration);
}

const INTERVAL_MAP = {
  "1m": "M1",
  "5m": "M5",
  "1h": "H1",
} as const;

const INTERVAL_DURATION: Record<BinanceInterval, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "1h": 3_600_000,
};

interface CheckDatabaseParams {
  symbol: string;
  interval: BinanceInterval;
  marketType?: BinanceMarketType;
  startTime: Date;
  endTime: Date;
}

export async function checkDatabaseCandleQuality({
  symbol,
  interval,
  startTime,
  endTime,
  marketType = "SPOT",
}: CheckDatabaseParams) {
  if (!areCandleDatesValid([startTime, endTime]) || startTime > endTime) {
    throw new Error("Invalid date range");
  }

  const candles = await findCandleOpenTimes(
    symbol,
    INTERVAL_MAP[interval],
    startTime,
    endTime,
    marketType,
  );

  const openTimes = candles.map((candle) => candle.openTime);

  const missingCandles = detectMissingCandlesInRange(
    openTimes,
    startTime,
    endTime,
    INTERVAL_DURATION[interval],
  );

  return {
    symbol,
    interval,
    checkedCandles: candles.length,
    missingCandles,
  };
}
export function detectTrailingMissingCandles(
  latestOpenTime: Date,
  intervalDuration: number,
  now: Date = new Date(),
): Date[] {
  const latestClosedTime =
    Math.floor((now.getTime() - intervalDuration) / intervalDuration) *
    intervalDuration;

  const missing: Date[] = [];

  let expectedTime = latestOpenTime.getTime() + intervalDuration;

  while (expectedTime <= latestClosedTime) {
    missing.push(new Date(expectedTime));
    expectedTime += intervalDuration;
  }

  return missing;
}

export function detectMissingCandlesInRange(
  openTimes: Date[],
  startTime: Date,
  endTime: Date,
  intervalDuration: number,
): Date[] {
  const existingTimes = new Set(openTimes.map((date) => date.getTime()));

  const firstExpectedTime =
    Math.ceil(startTime.getTime() / intervalDuration) * intervalDuration;

  const lastClosedTime =
    Math.floor(endTime.getTime() / intervalDuration) * intervalDuration -
    intervalDuration;

  const missingCandles: Date[] = [];

  for (
    let expectedTime = firstExpectedTime;
    expectedTime <= lastClosedTime;
    expectedTime += intervalDuration
  ) {
    if (!existingTimes.has(expectedTime)) {
      missingCandles.push(new Date(expectedTime));
    }
  }

  return missingCandles;
}
