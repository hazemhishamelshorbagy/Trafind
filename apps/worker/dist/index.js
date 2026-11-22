/**
 * What: Starts the worker, repairs initial history, schedules checks,
 * and handles graceful shutdown.
 *
 * Why: Coordinates market data collection, data repair, and Spot
 * paper trading while keeping Futures paper trading disabled.
 */
import { prisma } from "@trafind/database";
import { repairMissingCandles } from "./services/data-repair.service.js";
import { startDataRepairScheduler } from "./schedulers/data-repair.scheduler.js";
import { connectBinanceWebSocket } from "./clients/binance-websocket.client.js";
import { processActivePaperAccounts } from "./paper-trading/paper-trading.service.js";
const FIVE_MINUTES = 5 * 60 * 1000;
const LOOKBACK_HOURS = 24;
const INITIAL_HISTORY_DAYS = 30;
const SYMBOL = "SOLUSDT";
let stopScheduler;
let stopLiveFeeds;
let isShuttingDown = false;
console.log("Trafind Worker starting...");
async function verifyInitialHistory() {
    console.log("Checking historical data completeness...");
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() -
        INITIAL_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    // Repair Spot 1-minute history.
    const spotMinuteResult = await repairMissingCandles({
        symbol: SYMBOL,
        interval: "1m",
        marketType: "SPOT",
        startTime,
        endTime
    });
    if (spotMinuteResult.remaining > 0) {
        throw new Error(`Initial Spot M1 data check failed. ${spotMinuteResult.remaining} candles are still missing.`);
    }
    // Repair hourly history for both market types.
    for (const marketType of ["SPOT", "USD_M_FUTURES"]) {
        const hourlyResult = await repairMissingCandles({
            symbol: SYMBOL,
            interval: "1h",
            marketType,
            startTime,
            endTime
        });
        if (hourlyResult.remaining > 0) {
            throw new Error(`Initial ${marketType} H1 data check failed. ${hourlyResult.remaining} candles are still missing.`);
        }
    }
    console.log("Initial data completeness verified.");
}
function startLiveFeeds() {
    const liveFeeds = [
        connectBinanceWebSocket({
            symbol: SYMBOL,
            interval: "1m",
            marketType: "SPOT"
        }),
        connectBinanceWebSocket({
            symbol: SYMBOL,
            interval: "1h",
            marketType: "SPOT"
        }),
        connectBinanceWebSocket({
            symbol: SYMBOL,
            interval: "1h",
            marketType: "USD_M_FUTURES"
        })
    ];
    stopLiveFeeds = () => {
        console.log("Stopping Binance live feeds...");
        for (const feed of liveFeeds) {
            feed.close();
        }
    };
}
async function runScheduledTasks() {
    const repairEndTime = new Date();
    const repairStartTime = new Date(repairEndTime.getTime() -
        LOOKBACK_HOURS * 60 * 60 * 1000);
    // Repair Spot M1 data.
    await repairMissingCandles({
        symbol: SYMBOL,
        interval: "1m",
        marketType: "SPOT",
        startTime: repairStartTime,
        endTime: repairEndTime
    });
    // Repair hourly market data.
    for (const marketType of ["SPOT", "USD_M_FUTURES"]) {
        await repairMissingCandles({
            symbol: SYMBOL,
            interval: "1h",
            marketType,
            startTime: repairStartTime,
            endTime: repairEndTime
        });
    }
    // Paper Trading currently runs on Spot only.
    await processActivePaperAccounts(SYMBOL, "SPOT");
}
async function startWorker() {
    await verifyInitialHistory();
    if (isShuttingDown) {
        return;
    }
    startLiveFeeds();
    stopScheduler = startDataRepairScheduler({
        intervalMs: FIVE_MINUTES,
        task: runScheduledTasks
    });
    console.log("Trafind Worker started successfully.");
    // Run the first scheduled task immediately.
    // The scheduler will handle subsequent executions.
    await runScheduledTasks();
}
// Graceful shutdown.
async function shutdown() {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.log("Shutting down Trafind Worker...");
    try {
        // Stop new scheduled executions and wait for the current task.
        await stopScheduler?.();
        // Stop Binance WebSocket connections.
        stopLiveFeeds?.();
        // Disconnect Prisma after background work has stopped.
        await prisma.$disconnect();
        console.log("Trafind Worker stopped.");
        process.exit(0);
    }
    catch (error) {
        console.error("Worker shutdown failed:", error);
        process.exit(1);
    }
}
process.on("SIGINT", () => {
    void shutdown();
});
process.on("SIGTERM", () => {
    void shutdown();
});
// Start application.
void startWorker().catch(async (error) => {
    console.error("Worker startup failed:", error);
    stopLiveFeeds?.();
    try {
        await stopScheduler?.();
        await prisma.$disconnect();
    }
    finally {
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map