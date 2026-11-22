export type ExecutionAction = "BUY" | "SELL";
export interface ExecutionResult {
    expectedPrice: number;
    executionPrice: number;
    slippage: number;
    quantity: number;
    totalValue: number;
    fee: number;
    totalCost: number;
    netCashFlow: number;
}
export declare function simulateExecution(action: ExecutionAction, expectedPrice: number, slippageRate: number, quantity: number, feeRate: number): ExecutionResult;
