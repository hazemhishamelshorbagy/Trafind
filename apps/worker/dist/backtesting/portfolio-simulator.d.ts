import type { ExecutionResult } from "./execution-simulator.js";
export interface Portfolio {
    cash: number;
    assetQuantity: number;
    equity: number;
    unrealizedPnL: number;
    averageEntryPrice: number;
    realizedPnL: number;
}
export declare function createPortfolio(initialCapital: number): Portfolio;
export declare function calculatePortfolioValue(portfolio: Portfolio, currentPrice: number): Portfolio;
export declare function buyAsset(portfolio: Portfolio, execution: ExecutionResult, currentPrice: number): Portfolio;
export declare function sellAsset(portfolio: Portfolio, execution: ExecutionResult, currentPrice: number): Portfolio;
