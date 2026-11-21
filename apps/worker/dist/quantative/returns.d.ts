/**
 * What: Calculates percentage returns between consecutive closing prices.
 * Why: Provides validated return series for return and volatility calculations.
 */
export declare function calculateReturn(previousClose: number, currentClose: number): number;
export declare function calculateReturns(closes: number[]): number[];
