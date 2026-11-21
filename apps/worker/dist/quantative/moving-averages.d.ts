/**
 * What: Calculates simple and exponential moving averages.
 * Why: Provides trend measurements for closing-price series.
 */
export declare function calculateSMA(closes: number[], period: number): number[];
export declare function calculateEMAFromValues(values: number[], period: number): number[];
export declare function calculateEMA(closes: number[], period: number): number[];
