import assert from "node:assert/strict";
import { analyzePerformance } from "../performance-analyzer.js";

const report = analyzePerformance({
  initialCapital: 1000,
  finalEquity: 1010,
  trades: [
    {
      entryPrice: 100,
      exitPrice: 110,
      quantity: 1,
      pnl: 10,
      entryTime: new Date("2026-01-01T00:00:00.000Z"),
      exitTime: new Date("2026-01-02T00:00:00.000Z"),
        exitReason: "STRATEGY_EXIT"
    }
  ],
  equityCurve: [
    { time: new Date("2026-01-01T00:00:00.000Z"), equity: 1000 },
    { time: new Date("2026-01-02T00:00:00.000Z"), equity: 1010 }
  ]
});

assert.equal(report.profitFactor, null);

console.log("JSON-safe performance test passed.");
