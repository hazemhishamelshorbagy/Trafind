import { loadHistoricalData } from "../historical-data-loader.js";
import { runBacktestEngine } from "../backtest-engine.js";
import { defaultBacktestConfig } from "../backtest.config.js";
const strategy = {
    name: "Simple Moving Direction",
    analyze(candles) {
        if (candles.length < 2) {
            return {
                action: "HOLD",
                reason: "Not enough candles"
            };
        }
        const current = candles[candles.length - 1];
        const previous = candles[candles.length - 2];
        if (current.close > previous.close) {
            return {
                action: "BUY",
                reason: "Price increased",
                stopLoss: current.close * 0.99
            };
        }
        if (current.close < previous.close) {
            return {
                action: "SELL",
                reason: "Price decreased"
            };
        }
        return {
            action: "HOLD",
            reason: "No price movement"
        };
    }
};
async function main() {
    const candles = await loadHistoricalData({
        symbol: "SOLUSDT",
        interval: "M1",
        limit: 1000
    });
    const result = runBacktestEngine({
        candles,
        strategy,
        config: defaultBacktestConfig
    });
    console.log("Backtest Result:");
    console.dir(result, { depth: null });
    let missingCandles = 0;
    for (let i = 1; i < candles.length; i++) {
        const difference = candles[i].openTime.getTime() -
            candles[i - 1].openTime.getTime();
        if (difference !== 60_000) {
            missingCandles++;
            console.log("Candle Gap:", {
                previous: candles[i - 1].openTime,
                current: candles[i].openTime,
                differenceMinutes: difference / 60_000
            });
        }
    }
    console.log("Missing Candle Gaps:", missingCandles);
}
main().catch(console.error);
//# sourceMappingURL=test-backtest-engine.js.map