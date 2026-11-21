type MarketInterval = "1m" | "5m" | "1h";
export declare function getHistoricalVolatility(symbol: string, interval: MarketInterval, limit: number): Promise<number>;
export {};
