export interface RiskConfig {
  riskPerTrade: number;
  maxOpenPositions: number;
  maxDailyLoss: number;
  maxDrawdown: number;
}

export interface RiskState {
  equity: number;
  dailyStartingEquity: number;
  peakEquity: number;
  openPositions: number;
}

export interface PositionSizeInput {
  equity: number;
  entryPrice: number;
  stopLoss: number;
  riskPerTrade: number;
  riskPerUnit?: number;
}

export interface RiskDecision {
  approved: boolean;
  reason: string;
  quantity: number;
  riskAmount: number;
}

export function createRiskManager(config: RiskConfig) {
  function validateConfig(): void {
    if (
      !Number.isFinite(config.riskPerTrade) ||
      config.riskPerTrade <= 0 ||
      config.riskPerTrade > 1 ||
      !Number.isInteger(config.maxOpenPositions) ||
      config.maxOpenPositions <= 0 ||
      !Number.isFinite(config.maxDailyLoss) ||
      config.maxDailyLoss <= 0 ||
      config.maxDailyLoss > 1 ||
      !Number.isFinite(config.maxDrawdown) ||
      config.maxDrawdown <= 0 ||
      config.maxDrawdown > 1
    ) {
      throw new Error("Invalid risk configuration");
    }
  }

  validateConfig();

  function calculatePositionSize({
    equity,
    entryPrice,
    stopLoss,
    riskPerTrade,
    riskPerUnit = entryPrice - stopLoss
  }: PositionSizeInput): number {
    if (
      !Number.isFinite(equity) ||
      equity <= 0 ||
      !Number.isFinite(entryPrice) ||
      entryPrice <= 0 ||
      !Number.isFinite(stopLoss) ||
      stopLoss <= 0 ||
      !Number.isFinite(riskPerTrade) ||
      riskPerTrade <= 0 ||
      riskPerTrade > 1 ||
      !Number.isFinite(riskPerUnit) ||
      riskPerUnit <= 0 ||
      stopLoss >= entryPrice
    ) {
      throw new Error("Invalid position size input");
    }

    const riskAmount = equity * riskPerTrade;

    return riskAmount / riskPerUnit;
  }

  function evaluateRisk(
    state: RiskState,
    entryPrice: number,
    stopLoss: number,
    riskPerUnit = entryPrice - stopLoss
  ): RiskDecision {
    if (
      !Number.isFinite(state.equity) ||
      state.equity <= 0 ||
      !Number.isFinite(state.dailyStartingEquity) ||
      state.dailyStartingEquity <= 0 ||
      !Number.isFinite(state.peakEquity) ||
      state.peakEquity <= 0 ||
      !Number.isInteger(state.openPositions) ||
      state.openPositions < 0
    ) {
      throw new Error("Invalid risk state");
    }

    if (state.openPositions >= config.maxOpenPositions) {
      return {
        approved: false,
        reason: "Maximum open positions reached",
        quantity: 0,
        riskAmount: 0
      };
    }

    const dailyLoss =
      (state.dailyStartingEquity - state.equity) /
      state.dailyStartingEquity;

    if (dailyLoss >= config.maxDailyLoss) {
      return {
        approved: false,
        reason: "Maximum daily loss reached",
        quantity: 0,
        riskAmount: 0
      };
    }

    const drawdown =
      (state.peakEquity - state.equity) /
      state.peakEquity;

    if (drawdown >= config.maxDrawdown) {
      return {
        approved: false,
        reason: "Maximum drawdown reached",
        quantity: 0,
        riskAmount: 0
      };
    }

    const quantity = calculatePositionSize({
      equity: state.equity,
      entryPrice,
      stopLoss,
      riskPerTrade: config.riskPerTrade,
      riskPerUnit
    });

    return {
      approved: true,
      reason: "Risk checks passed",
      quantity,
      riskAmount: state.equity * config.riskPerTrade
    };
  }

  return {
    calculatePositionSize,
    evaluateRisk
  };
}