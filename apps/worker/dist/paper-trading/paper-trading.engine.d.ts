import type { Candle } from "../backtesting/backtest.types.js";
export interface PaperAccountState {
    id: string;
    marketType: "SPOT" | "USD_M_FUTURES";
    initialCapital: number;
    cash: number;
    assetQuantity: number;
    averageEntryPrice: number | null;
    stopLossPrice: number | null;
    isolatedMargin: number;
    realizedPnl: number;
    equity: number;
    lastMarkPrice: number | null;
    peakEquity: number;
    dailyStartingEquity: number;
    currentDay: string;
    pendingAction: "BUY" | "SELL" | null;
    pendingReason: string | null;
    pendingStopLoss: number | null;
    pendingSignalOpenTime: Date | null;
    lastProcessedOpenTime: Date | null;
    leverage: number;
    feeRate: number;
    slippageRate: number;
}
export interface PaperTradeDraft {
    accountId: string;
    candleOpenTime: Date;
    action: "BUY" | "SELL" | "FUNDING";
    executionPrice: number;
    quantity: number;
    fee: number;
    fundingAmount: number;
    realizedPnl: number;
    reason: string;
}
export interface PaperCandleResult {
    account: Omit<PaperAccountState, "id">;
    trades: PaperTradeDraft[];
}
export declare function processPaperCandle(account: PaperAccountState, history: Candle[], candle: Candle, fundingRate?: number): PaperCandleResult;
