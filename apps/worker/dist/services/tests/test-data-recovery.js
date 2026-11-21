/**
 * What: Manually runs missing-candle recovery for SOLUSDT.
 * Why: Smoke-tests recovery from the latest database candle to the present.
 */
import { recoverMissingCandles } from "../data-recovery.service.js";
async function main() {
    try {
        await recoverMissingCandles({
            symbol: "SOLUSDT",
            interval: "1m"
        });
    }
    catch (error) {
        console.error("Data recovery failed:", error);
    }
}
main();
//# sourceMappingURL=test-data-recovery.js.map