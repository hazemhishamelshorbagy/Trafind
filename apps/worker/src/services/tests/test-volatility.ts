/**
 * What: Runs a manual integration check for historical volatility.
 * Why: Verifies volatility calculation against database candle data.
 */
import { prisma } from "@trafind/database";
import { getHistoricalVolatility } from "../volatility.service.js";

try {
  const volatility = await getHistoricalVolatility(
    "SOLUSDT",
    "1m",
    100
  );

  console.log("SOLUSDT Historical Volatility:", volatility);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}