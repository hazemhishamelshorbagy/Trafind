export interface BacktestConfig {
    initialCapital: number;
    feeRate: number;
    slippageRate: number;
    riskPerTrade: number;
    maxOpenPositions: number;
    maxDailyLoss: number;
    maxDrawdown: number;
}
export declare const defaultBacktestConfig: BacktestConfig;
