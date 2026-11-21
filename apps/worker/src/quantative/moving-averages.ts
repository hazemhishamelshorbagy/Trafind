/**
 * What: Calculates simple and exponential moving averages.
 * Why: Provides trend measurements for closing-price series.
 */
export function calculateSMA(
  closes: number[],
  period: number
): number[] {
  if (
    !Number.isInteger(period) ||
    period <= 0 ||
    closes.length < period ||
    !closes.every(
      (price) => Number.isFinite(price) && price > 0
    )
  ) {
    throw new Error("Invalid SMA input");
  }

  const results: number[] = [];

  for (let i = 0; i <= closes.length - period; i++) {
    const window = closes.slice(i, i + period);

    const sum = window.reduce(
      (total, price) => total + price,
      0
    );

    results.push(sum / period);
  }

  return results;
}

export function calculateEMAFromValues(
  values: number[],
  period: number
): number[] {
  if (
    !Number.isInteger(period) ||
    period <= 0 ||
    values.length < period ||
    !values.every(Number.isFinite)
  ) {
    throw new Error("Invalid EMA input");
  }

  const alpha = 2 / (period + 1);

  const initialSMA =
    values.slice(0, period).reduce((sum, value) => sum + value, 0) /
    period;

  const results = [initialSMA];

  for (let i = period; i < values.length; i++) {
    const previousEMA = results[results.length - 1];

    const currentEMA =
      values[i] * alpha + previousEMA * (1 - alpha);

    results.push(currentEMA);
  }

  return results;
}

export function calculateEMA(
  closes: number[],
  period: number
): number[] {
  if (!closes.every((price) => Number.isFinite(price) && price > 0)) {
    throw new Error("Invalid closing prices");
  }

  return calculateEMAFromValues(closes, period);
}