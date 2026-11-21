type MarketInterval = "1m" | "5m" | "1h";
export declare function getLatestMarketFeatures(symbol: string, interval: MarketInterval, limit: number): Promise<{
    priceChange: number;
    priceChangePercent: number;
    candleRange: number;
    candleRangePercent: number;
    bodySize: number;
    upperWick: number;
    lowerWick: number;
    volume: number;
    openTime: Date;
}[]>;
export {};
