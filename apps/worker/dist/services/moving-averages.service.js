/**
 * What: Fetches recent candles and calculates requested moving averages.
 * Why: Exposes SMA and EMA values to worker and API callers.
 */
import { findLatestCandles } from "@trafind/database";
import { calculateEMA, calculateSMA } from "../quantative/moving-averages.js";
const INTERVAL_MAP = {
    "1m": "M1",
    "5m": "M5",
    "1h": "H1"
};
export async function getMovingAverages(symbol, interval, periods) {
    if (periods.length === 0 ||
        !periods.every((period) => Number.isInteger(period) && period > 0)) {
        throw new Error("Invalid periods");
    }
    const maxPeriod = Math.max(...periods);
    const candles = await findLatestCandles(symbol, INTERVAL_MAP[interval], maxPeriod);
    if (candles.length < maxPeriod) {
        throw new Error("Not enough candles");
    }
    const closes = candles.map((candle) => candle.close.toNumber());
    const results = {};
    for (const period of periods) {
        const sma = calculateSMA(closes, period);
        const ema = calculateEMA(closes, period);
        results[`sma${period}`] = sma[sma.length - 1];
        results[`ema${period}`] = ema[ema.length - 1];
    }
    return {
        symbol,
        interval,
        ...results
    };
}
//# sourceMappingURL=moving-averages.service.js.map