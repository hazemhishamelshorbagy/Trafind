import { checkDatabaseCandleQuality } from "./data-quality.service.js";
import { collectAndSaveHistoricalData } from "./historical-data.service.js";
export async function repairMissingCandles({ symbol, interval, marketType = "SPOT", startTime, endTime }) {
    console.log("Starting data repair...");
    // Step 1: Detect missing candles.
    const qualityResult = await checkDatabaseCandleQuality({
        symbol,
        interval,
        marketType,
        startTime,
        endTime
    });
    const missingCandles = qualityResult.missingCandles;
    if (missingCandles.length === 0) {
        console.log("No missing candles found.");
        return {
            repaired: 0,
            remaining: 0
        };
    }
    console.log("Missing candles detected:", {
        count: missingCandles.length,
        first: missingCandles[0],
        last: missingCandles[missingCandles.length - 1]
    });
    // Step 2: Recover the affected historical range.
    const recoveryResult = await collectAndSaveHistoricalData({
        symbol,
        interval,
        marketType,
        startTime: missingCandles[0].getTime(),
        endTime: missingCandles[missingCandles.length - 1].getTime(),
        resumeFromLatest: false
    });
    // Step 3: Verify the repaired range.
    const verificationResult = await checkDatabaseCandleQuality({
        symbol,
        interval,
        marketType,
        startTime,
        endTime
    });
    const remaining = verificationResult.missingCandles.length;
    console.log("Data repair completed:", {
        recovered: recoveryResult.totalSaved,
        remaining
    });
    return {
        repaired: recoveryResult.totalSaved,
        remaining
    };
}
//# sourceMappingURL=data-repair.service.js.map