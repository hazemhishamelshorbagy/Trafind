/**
 * What: Fetches recent candles and calculates historical volatility.
 * Why: Exposes volatility measurements to worker and API callers.
 */
import { findLatestCandles } from "@trafind/database";
import { calculateHistoricalVolatility } from "../quantative/volatility.js";
const INTERVAL_MAP = {
    "1m": "M1",
    "5m": "M5",
    "1h": "H1"
};
export async function getHistoricalVolatility(symbol, interval, limit) {
    const candles = await findLatestCandles(symbol, INTERVAL_MAP[interval], limit);
    if (candles.length < 2) {
        throw new Error("Not enough candles to calculate volatility");
    }
    const closes = candles.map((candle) => candle.close.toNumber());
    return calculateHistoricalVolatility(closes);
}
//# sourceMappingURL=volatility.service.js.map