/**
 * What: Calculates OHLC-based price, range, wick, and volume features for one candle.
 * Why: Converts raw candle values into reusable market metrics.
 */
export interface CandleInput {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface MarketFeatures {
    priceChange: number;
    priceChangePercent: number;
    candleRange: number;
    candleRangePercent: number;
    bodySize: number;
    upperWick: number;
    lowerWick: number;
    volume: number;
}
export declare function calculateMarketFeatures(candle: CandleInput): MarketFeatures;
