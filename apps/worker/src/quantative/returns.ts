/**
 * What: Calculates percentage returns between consecutive closing prices.
 * Why: Provides validated return series for return and volatility calculations.
 */
export function calculateReturn(
  previousClose: number,
  currentClose: number
): number {
  if (
    !Number.isFinite(previousClose) ||
    !Number.isFinite(currentClose) ||
    previousClose <= 0 ||
    currentClose <= 0
  ) {
    throw new Error("Invalid price values");
  }

  return ((currentClose - previousClose) / previousClose) * 100;
}

export function calculateReturns(closes: number[]): number[] {
  if (closes.length < 2) {
    return [];
  }

  const returns: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    returns.push(
      calculateReturn(closes[i - 1], closes[i])
    );
  }

  return returns;
}