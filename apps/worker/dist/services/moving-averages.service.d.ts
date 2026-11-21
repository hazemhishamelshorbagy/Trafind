type MarketInterval = "1m" | "5m" | "1h";
export declare function getMovingAverages(symbol: string, interval: MarketInterval, periods: number[]): Promise<{
    symbol: string;
    interval: MarketInterval;
}>;
export {};
