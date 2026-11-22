import assert from "node:assert/strict";
import { calculateCandleATR } from "../../quantative/atr.js";
import { emaTrendPullbackStrategy } from "../strategies/ema-trend-pullback.strategy.js";
import type { Candle } from "../backtest.types.js";

function createCandles(closes: number[]): Candle[] {
  return closes.map((close, index) => ({
    openTime: new Date(index * 60 * 60 * 1000),
    closeTime: new Date((index + 1) * 60 * 60 * 1000),
    open: close,
    high: close * 1.002,
    low: close * 0.998,
    close,
    volume: 1
  }));
}

const risingPrices = Array.from({ length: 250 }, (_, index) =>
  100 * 1.003 ** index
);
const pullbackPrices = [...risingPrices];
let price = pullbackPrices[pullbackPrices.length - 1];

for (let index = 0; index < 15; index++) {
  price *= 0.996;
  pullbackPrices.push(price);
}

for (let index = 0; index < 3; index++) {
  price *= 1.004;
  pullbackPrices.push(price);
}

const entryCandles = createCandles(pullbackPrices);
const entrySignal = emaTrendPullbackStrategy.analyze(entryCandles);
const currentATR = calculateCandleATR(entryCandles, 14).at(-1)!;

assert.equal(entrySignal.action, "BUY");
assert.equal(
  entrySignal.stopLoss,
  entryCandles[entryCandles.length - 1].close - 2 * currentATR
);

assert.equal(
  emaTrendPullbackStrategy.analyze(createCandles(risingPrices.slice(0, 199)))
    .action,
  "HOLD"
);
assert.equal(
  emaTrendPullbackStrategy.analyze(createCandles(risingPrices)).action,
  "SELL"
);

const fallingPrices = Array.from({ length: 250 }, (_, index) =>
  100 * 0.997 ** index
);
assert.equal(
  emaTrendPullbackStrategy.analyze(createCandles(fallingPrices)).action,
  "SELL"
);

console.log("EMA Trend Pullback unit tests passed.");
