export type ExitReason =
  | "STOP_LOSS"
  | "STRATEGY_EXIT"
  | "END_OF_BACKTEST";

export interface ClosedTrade {
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  entryTime: Date;
  exitTime: Date;
  exitReason: ExitReason;
}

export interface EquityPoint {
  time: Date;
  equity: number;
}

export interface PerformanceInput {
  initialCapital: number;
  finalEquity: number;
  trades: ClosedTrade[];
  equityCurve: EquityPoint[];
}

export interface PerformanceReport {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  profitFactor: number;
  netProfit: number;
}