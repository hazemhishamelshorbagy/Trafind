/**
 * What: Calculates true ranges and Average True Range values.
 * Why: Measures recent candle volatility and price movement.
 */
export declare function calculateTrueRange(high: number, low: number, previousClose: number): number;
export declare function calculateInitialATR(trueRanges: number[]): number;
export declare function calculateSmoothedATR(previousATR: number, currentTrueRange: number, period: number): number;
export declare function calculateATR(trueRanges: number[], period: number): number[];
interface CandleInput {
    high: number;
    low: number;
    close: number;
}
export declare function calculateTrueRanges(candles: CandleInput[]): number[];
export declare function calculateCandleATR(candles: CandleInput[], period: number): number[];
export {};
