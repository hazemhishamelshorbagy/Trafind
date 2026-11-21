/**
 * What: Manually repairs and verifies a fixed SOLUSDT historical range.
 * Why: Provides an end-to-end check of gap detection and recollection.
 */
import { repairMissingCandles } from "../data-repair.service.js";
const result = await repairMissingCandles({
    symbol: "SOLUSDT",
    interval: "1m",
    startTime: new Date("2026-11-19T12:00:00Z"),
    endTime: new Date("2026-11-19T12:20:00Z")
});
console.log("Final Repair Result:", result);
//# sourceMappingURL=test-data-repair.js.map