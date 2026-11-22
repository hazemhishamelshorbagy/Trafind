import type { Candle } from "./backtest.types.js";
import { simulateExecution } from "./execution-simulator.js";

export interface BuyAndHoldBenchmark {
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  finalEquity: number;
  totalReturn: number;
}

export function calculateBuyAndHoldBenchmark({
  candles,
  initialCapital,
  feeRate,
  slippageRate
}: {
  candles: Candle[];
  initialCapital: number;
  feeRate: number;
  slippageRate: number;
}): BuyAndHoldBenchmark {
  if (
    candles.length < 2 ||
    !Number.isFinite(initialCapital) ||
    initialCapital <= 0
  ) {
    throw new Error("Invalid buy-and-hold benchmark input");
  }

  const entryExpectedPrice = candles[0].open;
  const exitExpectedPrice = candles[candles.length - 1].close;
  const affordableQuantity =
    initialCapital /
    (entryExpectedPrice * (1 + slippageRate) * (1 + feeRate));
  const quantity = affordableQuantity * (1 - 1e-10);

  const buyExecution = simulateExecution(
    "BUY",
    entryExpectedPrice,
    slippageRate,
    quantity,
    feeRate
  );
  const sellExecution = simulateExecution(
    "SELL",
    exitExpectedPrice,
    slippageRate,
    quantity,
    feeRate
  );
  const finalEquity =
    initialCapital +
    buyExecution.netCashFlow +
    sellExecution.netCashFlow;

  return {
    entryPrice: buyExecution.executionPrice,
    exitPrice: sellExecution.executionPrice,
    quantity,
    finalEquity,
    totalReturn:
      ((finalEquity - initialCapital) / initialCapital) * 100
  };
}
