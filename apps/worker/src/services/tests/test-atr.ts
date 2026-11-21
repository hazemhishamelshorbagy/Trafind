/**
 * What: Runs a manual integration check for Average True Range.
 * Why: Verifies ATR calculation against database candle data.
 */
import { prisma } from "@trafind/database";
import { getATR } from "../atr.service.js";

try {
  const result = await getATR("SOLUSDT", "1m", 14);

  console.log("SOLUSDT ATR:", result);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}