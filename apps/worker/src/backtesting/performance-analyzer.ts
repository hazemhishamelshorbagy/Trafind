import type {
  PerformanceInput,
  PerformanceReport
} from "./performance.types.js";

export function analyzePerformance({
  initialCapital,
  finalEquity,
  trades,
  equityCurve
}: PerformanceInput): PerformanceReport {
  if (
    !Number.isFinite(initialCapital) ||
    initialCapital <= 0 ||
    !Number.isFinite(finalEquity) ||
    finalEquity < 0
  ) {
    throw new Error("Invalid performance input");
  }

  const totalTrades = trades.length;

  const winningTrades = trades.filter(
    (trade) => trade.pnl > 0
  ).length;

  const losingTrades = trades.filter(
    (trade) => trade.pnl < 0
  ).length;

  const winRate =
    totalTrades === 0
      ? 0
      : (winningTrades / totalTrades) * 100;

  const netProfit = finalEquity - initialCapital;

  const totalReturn =
    (netProfit / initialCapital) * 100;

  const grossProfit = trades
    .filter((trade) => trade.pnl > 0)
    .reduce((sum, trade) => sum + trade.pnl, 0);

  const grossLoss = Math.abs(
    trades
      .filter((trade) => trade.pnl < 0)
      .reduce((sum, trade) => sum + trade.pnl, 0)
  );

  const profitFactor =
    grossLoss === 0
      ? grossProfit > 0
        ? Infinity
        : 0
      : grossProfit / grossLoss;

  let peakEquity = initialCapital;
  let maxDrawdown = 0;

  for (const point of equityCurve) {
    if (!Number.isFinite(point.equity) || point.equity < 0) {
      throw new Error("Invalid equity curve");
    }

    peakEquity = Math.max(peakEquity, point.equity);

    const drawdown =
      ((peakEquity - point.equity) / peakEquity) * 100;

    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    totalReturn,
    maxDrawdown,
    profitFactor,
    netProfit
  };
}