import { collectAndSaveHistoricalData } from "../historical-data.service.js";

async function main() {
  const ONE_HOUR = 60 * 60 * 1000;
  const SIX_MONTHS = 180 * 24 * ONE_HOUR;

  // بداية الساعة الحالية
  const endBoundary = Math.floor(Date.now() / ONE_HOUR) * ONE_HOUR;

  // آخر شمعة H1 مكتملة
  const endTime = endBoundary - 1;

  // نبدأ من 180 يوم قبل بداية الساعة الحالية
  const startTime = endBoundary - SIX_MONTHS;

  try {
    console.log("Starting historical collection...");
    console.log("Symbol: SOLUSDT");
    console.log("Interval: 1h");
    console.log("Period: 180 days");

    const result = await collectAndSaveHistoricalData({
      symbol: "SOLUSDT",
      interval: "1h",
      startTime,
      endTime
    });

    console.log("\nFinal Result:");
    console.log(result);
  } catch (error) {
    console.error("Historical collection failed:", error);
  }
}

main();