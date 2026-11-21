/**
 * What: Builds MACD, signal, and histogram values from closing prices.
 * Why: Separates momentum calculation from database access and API behavior.
 * Details:
 * - Fast and slow EMAs expose short- and long-term trend changes.
 * - MACD equals the fast EMA minus the slower EMA.
 * - The signal line is an EMA of the MACD line.
 * - The histogram shows whether MACD is above or below its signal line.
 */
import { calculateEMA } from "./moving-averages.js";
import { calculateEMAFromValues } from "./moving-averages.js";
export function calculateMACDLine(
  closes: number[],
  fastPeriod: number,
  slowPeriod: number
): number[] {
  // MACD requires positive periods, a faster period, and enough slow-period samples.
  if (
    !Number.isInteger(fastPeriod) ||
    !Number.isInteger(slowPeriod) ||
    fastPeriod <= 0 ||
    slowPeriod <= 0 ||
    fastPeriod >= slowPeriod ||
    closes.length < slowPeriod
  ) {
    throw new Error("Invalid MACD input");
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // Align the shorter fast EMA with the slower EMA's first available result.
  const offset = slowPeriod - fastPeriod;

  return slowEMA.map((slowValue, index) => {
    const fastValue = fastEMA[index + offset];
    return fastValue - slowValue;
  });
}



export function calculateSignalLine(
  macdValues: number[],
  signalPeriod: number
): number[] {
  return calculateEMAFromValues(macdValues, signalPeriod);
}

export function calculateMACDHistogram(
  macdValues: number[],
  signalValues: number[]
): number[] {
  // Both series must have the same length and at least one value.
  if (
    macdValues.length !== signalValues.length ||
    macdValues.length === 0
  ) {
    throw new Error("Invalid MACD and Signal values");
  }

  return macdValues.map(
    (macd, index) => macd - signalValues[index]
  );
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  const macdLine = calculateMACDLine(
    closes,
    fastPeriod,
    slowPeriod
  );

  // Validate the signal period after the MACD line establishes its result length.
  if (
    !Number.isInteger(signalPeriod) ||
    signalPeriod <= 0 ||
    macdLine.length < signalPeriod
  ) {
    throw new Error("Invalid MACD signal period");
  }

  const signalLine = calculateSignalLine(
    macdLine,
    signalPeriod
  );

  const offset = signalPeriod - 1;

  // Align each signal value with the later MACD value it corresponds to.
  const histogram = signalLine.map((signal, index) => {
    return macdLine[index + offset] - signal;
  });

  return {
    macdLine,
    signalLine,
    histogram
  };
}