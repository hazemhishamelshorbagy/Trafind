import { recoverMissingCandles } from "./data-recovery.service.js";

async function main() {
  try {
    await recoverMissingCandles({
      symbol: "SOLUSDT",
      interval: "1m"
    });
  } catch (error) {
    console.error("Data recovery failed:", error);
  }
}

main();