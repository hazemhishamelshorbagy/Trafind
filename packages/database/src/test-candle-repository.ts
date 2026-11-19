import "dotenv/config";
import { prisma } from "./client.js";
import {
  saveMany,
  findLatest
} from "./repositories/candle.repository.js";

async function main() {
  const testTime = new Date("2020-01-01T00:00:00.000Z");

  try {
    // 1. Save a test candle
    const savedCount = await saveMany([
      {
        symbol: "SOLUSDT",
        interval: "M1",
        openTime: testTime,
        closeTime: new Date(testTime.getTime() + 59_999),
        open: "74.85",
        high: "74.86",
        low: "74.63",
        close: "74.64",
        volume: "100",
        quoteAssetVolume: "7464",
        numberOfTrades: 50,
        takerBuyBaseVolume: "40",
        takerBuyQuoteVolume: "2985.6"
      }
    ]);

    console.log("Saved candles:", savedCount);

    // 2. Find the latest candle
    const latest = await findLatest("SOLUSDT", "M1");

    console.log("Latest candle:", latest);

    if (!latest || latest.openTime.getTime() !== testTime.getTime()) {
      throw new Error("Repository test failed");
    }

    console.log("Repository test passed!");
  } finally {
    // 3. Remove test data
    await prisma.candle.deleteMany({
      where: {
        symbol: "SOLUSDT",
        interval: "M1",
        openTime: testTime
      }
    });

    await prisma.$disconnect();
  }
}

main().catch(console.error);