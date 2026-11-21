type MarketInterval = "1m" | "5m" | "1h";
export declare function getATR(symbol: string, interval: MarketInterval, period: number): Promise<{
    symbol: string;
    interval: MarketInterval;
    period: number;
    atr: number;
    atrPercent: number;
}>;
export {};
