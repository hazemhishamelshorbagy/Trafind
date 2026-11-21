type MarketInterval = "1m" | "5m" | "1h";
export declare function getMACD(symbol: string, interval: MarketInterval, fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): Promise<{
    symbol: string;
    interval: MarketInterval;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    macd: number;
    signal: number;
    histogram: number;
}>;
export {};
