/**
 * What: Runs a manual integration check for MACD calculations.
 * Why: Confirms that database candle retrieval and MACD formulas work together.
 * Details:
 * - Uses SOLUSDT one-minute candles.
 * - Prints the latest MACD result to the console.
 * - Always disconnects Prisma in the finally block.
 */
import { getMACD } from "../macd.service.js";
import { prisma } from "../../../../../packages/database/dist/index.js";

try {
  const result = await getMACD("SOLUSDT", "1m");

  console.log("SOLUSDT MACD:", result);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}