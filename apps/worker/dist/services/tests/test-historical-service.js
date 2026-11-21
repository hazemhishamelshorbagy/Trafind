/**
 * What: Manually runs historical collection and database saving.
 * Why: Smoke-tests collection, validation, mapping, and persistence.
 */
import { collectAndSaveHistoricalData } from "../historical-data.service.js";
async function main() {
    const endTime = Date.now() - 60_000;
    const startTime = endTime - 10 * 60_000;
    try {
        const result = await collectAndSaveHistoricalData({
            symbol: "SOLUSDT",
            interval: "1m",
            startTime,
            endTime
        });
        console.log("\nFinal Result:");
        console.log(result);
    }
    catch (error) {
        console.error("Historical collection failed:", error);
    }
}
main();
//# sourceMappingURL=test-historical-service.js.map