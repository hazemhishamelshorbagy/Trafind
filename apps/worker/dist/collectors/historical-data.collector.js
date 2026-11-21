/**
 * What: Streams Binance historical kline pages using an advancing time cursor.
 * Why: Handles large ranges without loading every candle into memory at once.
 */
import { getKlines, } from "../clients/binance.client.js";
import { INTERVAL_DURATION } from "../types/market.types.js";
export async function* collectHistoricalKlines({ symbol, interval, startTime, endTime }) {
    let currentStartTime = startTime;
    while (currentStartTime <= endTime) {
        const batch = await getKlines({
            symbol,
            interval,
            limit: 1000,
            startTime: currentStartTime,
            endTime
        });
        if (batch.length === 0) {
            break;
        }
        yield batch;
        const lastCandle = batch[batch.length - 1];
        const nextStartTime = lastCandle[0] + INTERVAL_DURATION[interval];
        if (nextStartTime <= currentStartTime) {
            throw new Error("Historical collector failed to advance");
        }
        currentStartTime = nextStartTime;
        if (batch.length < 1000) {
            break;
        }
    }
}
//# sourceMappingURL=historical-data.collector.js.map