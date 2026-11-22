import { prisma } from "@trafind/database";
import { loadHistoricalData } from "../historical-data-loader.js";
import { runBacktestEngine } from "../backtest-engine.js";
import { emaTrendPullbackStrategy } from "../strategies/ema-trend-pullback.strategy.js";
import { defaultBacktestConfig } from "../backtest.config.js";
const EXPECTED_CANDLE_COUNT = 180 * 24;
const ONE_HOUR_MS = 60 * 60 * 1000;
async function main() {
    try {
        console.log("Starting six-month EMA Trend Pullback backtest...");
        const candles = await loadHistoricalData({
            symbol: "SOLUSDT",
            interval: "H1",
            limit: EXPECTED_CANDLE_COUNT
        });
        if (candles.length !== EXPECTED_CANDLE_COUNT) {
            throw new Error(`Expected ${EXPECTED_CANDLE_COUNT} hourly candles, got ${candles.length}`);
        }
        for (let index = 1; index < candles.length; index++) {
            const gap = candles[index].openTime.getTime() -
                candles[index - 1].openTime.getTime();
            if (gap !== ONE_HOUR_MS) {
                throw new Error(`Missing or misaligned H1 candle between ${candles[index - 1].openTime.toISOString()} and ${candles[index].openTime.toISOString()}`);
            }
        }
        console.log(`Loaded ${candles.length} contiguous H1 candles`);
        console.log("Range:", candles[0].openTime.toISOString(), "to", candles[candles.length - 1].closeTime.toISOString());
        const result = runBacktestEngine({
            candles,
            strategy: emaTrendPullbackStrategy,
            config: defaultBacktestConfig
        });
        console.log("\n========== BACKTEST RESULT ==========");
        console.log("Strategy:", result.strategyName);
        console.log("Total Candles:", result.totalCandles);
        console.log("\nFinal Portfolio:");
        console.log(result.finalPortfolio);
        console.log("\nClosed Trades:", result.trades.length);
        console.table(result.trades);
        console.log("\nPerformance Report:");
        console.log(result.performance);
        console.log("\n=====================================");
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((error) => {
    console.error("Backtest failed:", error);
    process.exitCode = 1;
});
//# sourceMappingURL=test-ema-trend-pullback.strategy.js.map