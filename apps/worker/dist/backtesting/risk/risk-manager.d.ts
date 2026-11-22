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
export declare function createRiskManager(config: RiskConfig): {
    calculatePositionSize: ({ equity, entryPrice, stopLoss, riskPerTrade, riskPerUnit }: PositionSizeInput) => number;
    evaluateRisk: (state: RiskState, entryPrice: number, stopLoss: number, riskPerUnit?: number) => RiskDecision;
};
