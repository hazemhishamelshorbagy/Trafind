/**
 * What: Manually runs the paginated historical kline collector.
 * Why: Smoke-tests paging behavior and the collected candle count.
 */
import { collectHistoricalKlines } from "../../collectors/historical-data.collector.js";

async function main() {
  const endTime = Date.now() - 60_000;
  const startTime = endTime - 10 * 60_000;

  try {
    for await (const batch of collectHistoricalKlines({
      symbol: "SOLUSDT",
      interval: "1m",
      startTime,
      endTime
    })) {
      console.log("Received batch:", batch.length);
      console.log("First candle:", new Date(batch[0][0]).toISOString());
      console.log(
        "Last candle:",
        new Date(batch[batch.length - 1][0]).toISOString()
      );
    }
  } catch (error) {
    console.error("Collector failed:", error);
  }
}

main();