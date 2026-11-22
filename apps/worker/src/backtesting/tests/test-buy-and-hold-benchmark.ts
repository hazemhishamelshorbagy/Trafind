import assert from "node:assert/strict";
import { calculateBuyAndHoldBenchmark } from "../buy-and-hold-benchmark.js";
import type { Candle } from "../backtest.types.js";

const candles: Candle[] = [
  {
    openTime: new Date("2026-01-01T00:00:00.000Z"),
    closeTime: new Date("2026-01-01T00:59:59.999Z"),
    open: 100,
    high: 101,
    low: 99,
    close: 100,
    volume: 1
  },
  {
    openTime: new Date("2026-01-01T01:00:00.000Z"),
    closeTime: new Date("2026-01-01T01:59:59.999Z"),
    open: 100,
    high: 121,
    low: 100,
    close: 120,
    volume: 1
  }
];

const result = calculateBuyAndHoldBenchmark({
  candles,
  initialCapital: 1000,
  feeRate: 0,
  slippageRate: 0
});

assert.equal(result.quantity, 1000 / 100 * (1 - 1e-10));
assert.ok(Math.abs(result.finalEquity - 1200) < 1e-6);
assert.ok(Math.abs(result.totalReturn - 20) < 1e-6);

console.log("Buy-and-hold benchmark test passed.");
