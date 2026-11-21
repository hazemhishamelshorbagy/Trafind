/**
 * What: Calculates OHLC-based price, range, wick, and volume features for one candle.
 * Why: Converts raw candle values into reusable market metrics.
 */
export interface CandleInput {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketFeatures {
  priceChange: number;
  priceChangePercent: number;
  candleRange: number;
  candleRangePercent: number;
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  volume: number;
}

export function calculateMarketFeatures(
  candle: CandleInput
): MarketFeatures {
  const { open, high, low, close, volume } = candle;

  if (
    ![open, high, low, close, volume].every(Number.isFinite) ||
    open <= 0 ||
    high <= 0 ||
    low <= 0 ||
    close <= 0 ||
    volume < 0
  ) {
    throw new Error("Invalid candle values");
  }

  if (
    high < Math.max(open, close) ||
    low > Math.min(open, close) ||
    high < low
  ) {
    throw new Error("Invalid OHLC relationship");
  }

  const priceChange = close - open;
  const candleRange = high - low;
  const bodySize = Math.abs(priceChange);

  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;

  return {
    priceChange,
    priceChangePercent: (priceChange / open) * 100,
    candleRange,
    candleRangePercent: (candleRange / open) * 100,
    bodySize,
    upperWick,
    lowerWick,
    volume
  };
}
