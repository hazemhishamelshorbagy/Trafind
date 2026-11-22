import { findCandlesByTimeRange, findLatestCandles } from "@trafind/database";
function toBacktestCandle(candle) {
    return {
        openTime: candle.openTime,
        closeTime: candle.closeTime,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume)
    };
}
export async function loadHistoricalData({ symbol, interval, limit }) {
    if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error("Invalid candle limit");
    }
    const candles = await findLatestCandles(symbol, interval, limit);
    if (candles.length === 0) {
        throw new Error("No historical candles found");
    }
    return candles.map(toBacktestCandle);
}
export async function loadHistoricalDataRange({ symbol, interval, startTime, endTimeExclusive }) {
    const candles = await findCandlesByTimeRange(symbol, interval, startTime, endTimeExclusive);
    if (candles.length === 0) {
        throw new Error("No historical candles found in the requested range");
    }
    return candles.map(toBacktestCandle);
}
//# sourceMappingURL=historical-data-loader.js.map