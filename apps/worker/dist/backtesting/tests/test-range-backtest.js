import { prisma } from "@trafind/database";
import { calculateBuyAndHoldBenchmark } from "../buy-and-hold-benchmark.js";
import { defaultBacktestConfig } from "../backtest.config.js";
import { runBacktestEngine } from "../backtest-engine.js";
import { loadHistoricalDataRange } from "../historical-data-loader.js";
import { emaTrendPullbackStrategy } from "../strategies/ema-trend-pullback.strategy.js";
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_RANGE_MS = 180 * 24 * ONE_HOUR_MS;
const MIN_CANDLES = 201;
function readDateArgument(name) {
    const prefix = `--${name}=`;
    const argument = process.argv
        .slice(2)
        .find((value) => value.startsWith(prefix));
    if (!argument) {
        throw new Error(`Missing required argument ${prefix}<UTC ISO date>`);
    }
    const value = argument.slice(prefix.length);
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) ||
        !value.endsWith("Z") ||
        date.getTime() % ONE_HOUR_MS !== 0) {
        throw new Error(`${name} must be an hour-aligned UTC ISO date ending in Z`);
    }
    return date;
}
async function main() {
    try {
        const startTime = readDateArgument("start");
        const endTimeExclusive = readDateArgument("end");
        const rangeMs = endTimeExclusive.getTime() - startTime.getTime();
        if (rangeMs <= 0 || rangeMs > MAX_RANGE_MS) {
            throw new Error("Requested range must be between 1 hour and 180 days");
        }
        const expectedCandleCount = rangeMs / ONE_HOUR_MS;
        if (expectedCandleCount < MIN_CANDLES) {
            throw new Error(`At least ${MIN_CANDLES} H1 candles are required for EMA 200`);
        }
        const candles = await loadHistoricalDataRange({
            symbol: "SOLUSDT",
            interval: "H1",
            startTime,
            endTimeExclusive
        });
        if (candles.length !== expectedCandleCount) {
            throw new Error(`Expected ${expectedCandleCount} H1 candles, got ${candles.length}`);
        }
        for (let index = 0; index < candles.length; index++) {
            const expectedOpenTime = startTime.getTime() + index * ONE_HOUR_MS;
            if (candles[index].openTime.getTime() !== expectedOpenTime) {
                throw new Error(`Missing or misaligned H1 candle at ${new Date(expectedOpenTime).toISOString()}`);
            }
        }
        const backtest = runBacktestEngine({
            candles,
            strategy: emaTrendPullbackStrategy,
            config: defaultBacktestConfig
        });
        const buyAndHold = calculateBuyAndHoldBenchmark({
            candles,
            initialCapital: defaultBacktestConfig.initialCapital,
            feeRate: defaultBacktestConfig.feeRate,
            slippageRate: defaultBacktestConfig.slippageRate
        });
        console.log("Backtest range:", {
            startInclusive: startTime.toISOString(),
            endExclusive: endTimeExclusive.toISOString(),
            candleCount: candles.length
        });
        console.log("Strategy:", backtest.strategyName);
        console.log("Strategy performance:", backtest.performance);
        console.log("Buy-and-hold benchmark:", buyAndHold);
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((error) => {
    console.error("Range backtest failed:", error);
    process.exitCode = 1;
});
//# sourceMappingURL=test-range-backtest.js.map