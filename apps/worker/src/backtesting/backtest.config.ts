export interface BacktestConfig {
  initialCapital: number;

  feeRate: number;
  slippageRate: number;

  riskPerTrade: number;
  maxOpenPositions: number;
  maxDailyLoss: number;
  maxDrawdown: number;
}

export const defaultBacktestConfig: BacktestConfig = {
  initialCapital: 1000,

  feeRate: 0.001,
  slippageRate: 0.0005,

  riskPerTrade: 0.01,
  maxOpenPositions: 1,
  maxDailyLoss: 0.03,
  maxDrawdown: 0.10
};