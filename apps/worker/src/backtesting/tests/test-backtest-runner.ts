import { prisma } from "@trafind/database";
import { Strategy } from "../backtest.types.js";
import { runBacktest } from "../backtest-runner.js";
import { loadHistoricalData } from "../historical-data-loader.js";

const testStrategy: Strategy = {
  name: "Price Direction Test",

  analyze(candles) {
    if (candles.length < 2) {
      return {
        action: "HOLD",
        reason: "Not enough candles"
      };
    }

    const current = candles[candles.length - 1];
    const previous = candles[candles.length - 2];

    if (current.close > previous.close) {
      return {
        action: "BUY",
        reason: "Price increased"
      };
    }

    if (current.close < previous.close) {
      return {
        action: "SELL",
        reason: "Price decreased"
      };
    }

    return {
      action: "HOLD",
      reason: "Price unchanged"
    };
  }
};

async function main() {
  try {
    const candles = await loadHistoricalData({
      symbol: "SOLUSDT",
      interval: "M1",
      limit: 100
    });

    const result = runBacktest({
      candles,
      strategy: testStrategy
    });

    console.log("Strategy:", result.strategyName);
    console.log("Total candles:", result.totalCandles);
    console.log("Total signals:", result.signals.length);

    console.log("First signals:", result.signals.slice(0, 5));
    console.log("Last signal:", result.signals.at(-1));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);