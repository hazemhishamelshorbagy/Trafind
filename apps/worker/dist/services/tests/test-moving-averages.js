/**
 * What: Runs a manual integration check for moving averages.
 * Why: Verifies SMA and EMA calculations against database candle data.
 */
import { prisma } from "@trafind/database";
import { getMovingAverages } from "../moving-averages.service.js";
try {
    const result = await getMovingAverages("SOLUSDT", "1m", [20, 50]);
    console.log("Moving Averages:", result);
}
catch (error) {
    console.error(error);
}
finally {
    await prisma.$disconnect();
}
//# sourceMappingURL=test-moving-averages.js.map