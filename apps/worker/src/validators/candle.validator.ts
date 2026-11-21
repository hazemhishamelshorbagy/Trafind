/**
 * What: Validates candle values and detects whether a candle is already closed.
 * Why: Prevents malformed or incomplete market data from entering PostgreSQL.
 */
import { MappedCandle } from "../types/market.types.js";


export function validateCandle(candle: MappedCandle): boolean {
  const open = Number(candle.open);
  const high = Number(candle.high);
  const low = Number(candle.low);
  const close = Number(candle.close);
  const volume = Number(candle.volume);

  const hasValidPrices = [
    open,
    high,
    low,
    close,
    volume
  ].every(Number.isFinite);

  if (!hasValidPrices) {
    return false;
  }

  if (open <= 0 || high <= 0 || low <= 0 || close <= 0) {
    return false;
  }

  if (volume < 0) {
    return false;
  }

  if (high < Math.max(open, close)) {
    return false;
  }

  if (low > Math.min(open, close)) {
    return false;
  }

  if (high < low) {
    return false;
  }

  if (candle.closeTime.getTime() < candle.openTime.getTime()) {
    return false;
  }

  return true;
}

export function isCandleClosed(
  candle: MappedCandle
): boolean {
  return candle.closeTime.getTime() < Date.now();
}