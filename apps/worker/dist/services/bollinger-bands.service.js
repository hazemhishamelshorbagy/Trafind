import { findLatestCandles } from "@trafind/database";
import { calculateBollingerBands } from "../quantative/bollinger-bands.js";
export async function getBollingerBands({ symbol, interval, period = 20, multiplier = 2 }) {
    if (!Number.isInteger(period) || period <= 0) {
        throw new Error("Invalid period");
    }
    const candles = await findLatestCandles(symbol, interval, period);
    if (candles.length < period) {
        throw new Error("Not enough candles");
    }
    const closes = candles.map((candle) => Number(candle.close));
    const bands = calculateBollingerBands(closes, period, multiplier);
    return bands.map((band, index) => ({
        openTime: candles[index].openTime,
        ...band
    }));
}
//# sourceMappingURL=bollinger-bands.service.js.map