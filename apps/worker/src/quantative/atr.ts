/**
 * What: Calculates true ranges and Average True Range values.
 * Why: Measures recent candle volatility and price movement.
 */
export function calculateTrueRange(
  high: number,
  low: number,
  previousClose: number
): number {
  if (
    ![high, low, previousClose].every(Number.isFinite) ||
    high <= 0 ||
    low <= 0 ||
    previousClose <= 0 ||
    high < low
  ) {
    throw new Error("Invalid price values");
  }

  return Math.max(
    high - low,
    Math.abs(high - previousClose),
    Math.abs(low - previousClose)
  );
}

export function calculateInitialATR(
  trueRanges: number[]
): number {
  if (
    trueRanges.length === 0 ||
    !trueRanges.every(
      (value) => Number.isFinite(value) && value >= 0
    )
  ) {
    throw new Error("Invalid true ranges");
  }

  const sum = trueRanges.reduce(
    (total, value) => total + value,
    0
  );

  return sum / trueRanges.length;
}

export function calculateSmoothedATR(
  previousATR: number,
  currentTrueRange: number,
  period: number
): number {
  if (
    !Number.isFinite(previousATR) ||
    !Number.isFinite(currentTrueRange) ||
    previousATR < 0 ||
    currentTrueRange < 0 ||
    !Number.isInteger(period) ||
    period <= 0
  ) {
    throw new Error("Invalid ATR smoothing values");
  }

  return (
    (previousATR * (period - 1) + currentTrueRange) /
    period
  );
}

export function calculateATR(
  trueRanges: number[],
  period: number
): number[] {
  if (
    !Number.isInteger(period) ||
    period <= 0 ||
    trueRanges.length < period ||
    !trueRanges.every(
      (value) => Number.isFinite(value) && value >= 0
    )
  ) {
    throw new Error("Invalid ATR input");
  }

  let currentATR = calculateInitialATR(
    trueRanges.slice(0, period)
  );

  const results = [currentATR];

  for (let i = period; i < trueRanges.length; i++) {
    currentATR = calculateSmoothedATR(
      currentATR,
      trueRanges[i],
      period
    );

    results.push(currentATR);
  }

  return results;
}

interface CandleInput {
  high: number;
  low: number;
  close: number;
}

export function calculateTrueRanges(
  candles: CandleInput[]
): number[] {
  if (candles.length < 2) {
    throw new Error("Not enough candles");
  }

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const currentCandle = candles[i];
    const previousCandle = candles[i - 1];

    const trueRange = calculateTrueRange(
      currentCandle.high,
      currentCandle.low,
      previousCandle.close
    );

    trueRanges.push(trueRange);
  }

  return trueRanges;
}

export function calculateCandleATR(
  candles: CandleInput[],
  period: number
): number[] {
  const trueRanges = calculateTrueRanges(candles);

  return calculateATR(trueRanges, period);
}