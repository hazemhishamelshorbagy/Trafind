/**
 * What: Manually exercises the Binance REST klines client.
 * Why: Provides a direct smoke check for network access and response formatting.
 */
import { getKlines } from "../binance.client.js";
import { mapBinanceKline } from "../../mappers/binance.mapper.js";
import { validateCandle, isCandleClosed, } from "../../validators/candle.validator.js";
// // candles
//   ├── candles[0]  ← أول شمعة
//   ├── candles[1]  ← ثاني شمعة
//   ├── candles[2]  ← ثالث شمعة
//   ├── candles[3]  ← رابع شمعة
//   └── candles[4]  ← خامس شمعة (الأخيرة)
// candles[4] = [
//   1795089600000,
//   "74.85",
//   "74.86",
//   "74.63",
//   "74.64",
//   "3689.96"
// ];
async function main() {
    try {
        const candles = await getKlines({
            symbol: "SOLUSDT",
            interval: "1m",
            limit: 5,
        });
        console.log("Successfully fetched candles!");
        console.log("Total candles:", candles.length);
        const mappedCandles = candles.map((candle) => mapBinanceKline(candle, "SOLUSDT", "1m"));
        const latestCandle = mappedCandles.at(-1);
        if (latestCandle) {
            console.log("Candle validation:", validateCandle(latestCandle));
            console.log("Is candle closed:", isCandleClosed(latestCandle));
            console.log("Close time:", latestCandle.closeTime);
            console.log("Current time:", new Date());
        }
        console.log("Mapped latest candle:", mappedCandles.at(-1));
        if (latestCandle) {
            console.log("Candle validation:", validateCandle(latestCandle));
        }
    }
    catch (error) {
        console.error("Failed to fetch Binance candles:", error);
    }
}
main();
//# sourceMappingURL=test-binance.js.map