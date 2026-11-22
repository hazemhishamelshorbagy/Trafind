import type { Candle } from "./backtest.types.js";
export interface BuyAndHoldBenchmark {
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    finalEquity: number;
    totalReturn: number;
}
export declare function calculateBuyAndHoldBenchmark({ candles, initialCapital, feeRate, slippageRate }: {
    candles: Candle[];
    initialCapital: number;
    feeRate: number;
    slippageRate: number;
}): BuyAndHoldBenchmark;
