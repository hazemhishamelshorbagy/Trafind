/**
 * What: Manually tests retry success and failure behavior.
 * Why: Provides focused runtime checks for timing and final-error propagation.
 */
import { retry } from "../retry.js";
let attempts = 0;
async function unstableOperation() {
    attempts++;
    console.log(`Attempt: ${attempts}`);
    if (attempts < 3) {
        throw new Error("Temporary database error");
    }
    return "Candle saved successfully";
}
async function main() {
    try {
        const result = await retry(unstableOperation, {
            retries: 2,
            delay: 1000
        });
        console.log(result);
    }
    catch (error) {
        console.error("Operation failed:", error);
    }
}
main();
//# sourceMappingURL=test-retry.js.map