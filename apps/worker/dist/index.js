/**
 * What: Starts the worker, repairs initial history, schedules checks, and handles shutdown.
 * Why: Coordinates the worker's startup and lifecycle around PostgreSQL and Binance data.
 */
import { prisma } from "@trafind/database";
import { repairMissingCandles } from "./services/data-repair.service.js";
import { startDataRepairScheduler } from "./schedulers/data-repair.scheduler.js";
const FIVE_MINUTES = 5 * 60 * 1000;
const LOOKBACK_HOURS = 24;
const INITIAL_HISTORY_DAYS = 30;
let stopScheduler;
console.log("Trafind Worker starting...");
async function startWorker() {
    console.log("Checking historical data completeness...");
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() -
        INITIAL_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    const result = await repairMissingCandles({
        symbol: "SOLUSDT",
        interval: "1m",
        startTime,
        endTime
    });
    if (result.remaining > 0) {
        throw new Error(`Initial data check failed. ${result.remaining} candles are still missing.`);
    }
    console.log("Initial data completeness verified.");
    stopScheduler = startDataRepairScheduler({
        intervalMs: FIVE_MINUTES,
        task: async () => {
            const repairEndTime = new Date();
            const repairStartTime = new Date(repairEndTime.getTime() -
                LOOKBACK_HOURS * 60 * 60 * 1000);
            await repairMissingCandles({
                symbol: "SOLUSDT",
                interval: "1m",
                startTime: repairStartTime,
                endTime: repairEndTime
            });
        }
    });
}
// 4. Graceful shutdown
let isShuttingDown = false;
async function shutdown() {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    console.log("Shutting down Worker...");
    try {
        await stopScheduler?.();
        await prisma.$disconnect();
        console.log("Worker stopped.");
        process.exit(0);
    }
    catch (error) {
        console.error("Worker shutdown failed:", error);
        process.exit(1);
    }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
// 5. Start application
void startWorker().catch(async (error) => {
    console.error("Worker startup failed:", error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=index.js.map