/**
 * What: Fetches recent candles and calculates current MACD indicators.
 * Why: Keeps database queries and period alignment outside the formula module.
 * Details:
 * - It loads enough candles for the slow EMA and signal-period calculation.
 * - Closing prices are converted from decimal database values to JavaScript numbers.
 * - It returns the latest MACD, signal, and histogram values for the symbol and interval.
 */
import { findLatestCandles } from "@trafind/database";
import { calculateMACD } from "../quantative/macd.js";
const INTERVAL_MAP = {
    "1m": "M1",
    "5m": "M5",
    "1h": "H1"
};
export async function getMACD(symbol, interval, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    // One slow-period EMA plus one signal period is the minimum usable result size.
    const minimumCandles = slowPeriod + signalPeriod - 1;
    const candles = await findLatestCandles(symbol, INTERVAL_MAP[interval], minimumCandles);
    if (candles.length < minimumCandles) {
        throw new Error("Not enough candles");
    }
    const closes = candles.map((candle) => candle.close.toNumber());
    const result = calculateMACD(closes, fastPeriod, slowPeriod, signalPeriod);
    const lastIndex = result.histogram.length - 1;
    return {
        symbol,
        interval,
        fastPeriod,
        slowPeriod,
        signalPeriod,
        macd: result.macdLine[lastIndex + signalPeriod - 1],
        signal: result.signalLine[lastIndex],
        histogram: result.histogram[lastIndex]
    };
}
//# sourceMappingURL=macd.service.js.map