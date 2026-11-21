/**
 * What: Fetches recent candles and calculates their market features.
 * Why: Provides the API-facing worker with normalized candle metrics.
 */
import { findLatestCandles } from "@trafind/database";
import { calculateMarketFeatures } from "../quantative/market-features.js";
const INTERVAL_MAP = {
    "1m": "M1",
    "5m": "M5",
    "1h": "H1"
};
export async function getLatestMarketFeatures(symbol, interval, limit) {
    const candles = await findLatestCandles(symbol, INTERVAL_MAP[interval], limit);
    return candles.map((candle) => {
        const input = {
            open: candle.open.toNumber(),
            high: candle.high.toNumber(),
            low: candle.low.toNumber(),
            close: candle.close.toNumber(),
            volume: candle.volume.toNumber()
        };
        return {
            openTime: candle.openTime,
            ...calculateMarketFeatures(input)
        };
    });
}
//# sourceMappingURL=market-features.service.js.map