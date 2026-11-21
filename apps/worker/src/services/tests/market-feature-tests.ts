/**
 * What: Runs a manual integration check for latest candle market features.
 * Why: Verifies market-feature calculation against database data.
 */
import { prisma } from "@trafind/database";
import { calculateMarketFeatures, CandleInput } from "../../quantative/market-features.js";
import { getLatestMarketFeatures } from "../market-features.service.js";


try {
  const result = await getLatestMarketFeatures(
    "SOLUSDT",
    "1m",
    5
  );

  console.log(result);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}