/**
 * What: Processes only closed Binance WebSocket candles and saves them to PostgreSQL.
 * Why: Prevents partial live updates from being stored and adds retry protection to writes.
 */
import { mapWebSocketMessageToKline, } from "../mappers/binance-websocket.mapper.js";
import { retry } from "../utils/retry.js";
import { mapBinanceKline } from "../mappers/binance.mapper.js";
import { validateCandle } from "../validators/candle.validator.js";
import { saveMany } from "@trafind/database";
const INTERVAL_MAP = {
    "1m": "M1",
    "5m": "M5",
    "1h": "H1"
};
export async function processLiveCandle(message) {
    // Ignore updates until the candle is closed.
    if (!message.k.x)
        return;
    const kline = mapWebSocketMessageToKline(message);
    const candle = mapBinanceKline(kline, message.s, message.k.i);
    if (!validateCandle(candle)) {
        console.warn("Invalid candle received:", candle);
        return;
    }
    const databaseCandle = {
        ...candle,
        interval: INTERVAL_MAP[candle.interval]
    };
    const saved = await retry(() => saveMany([databaseCandle]), {
        retries: 2,
        delay: 1000
    });
    console.log("Closed candle processed:", {
        symbol: candle.symbol,
        interval: candle.interval,
        openTime: candle.openTime.toISOString(),
        close: candle.close,
        saved
    });
}
//# sourceMappingURL=live-candle.service.js.map