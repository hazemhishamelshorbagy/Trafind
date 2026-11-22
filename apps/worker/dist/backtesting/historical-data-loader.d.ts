type CandleInterval = "M1" | "M5" | "H1";
interface LoadHistoricalDataInput {
    symbol: string;
    interval: CandleInterval;
    limit: number;
}
export declare function loadHistoricalData({ symbol, interval, limit }: LoadHistoricalDataInput): Promise<{
    openTime: Date;
    closeTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}[]>;
export declare function loadHistoricalDataRange({ symbol, interval, startTime, endTimeExclusive }: {
    symbol: string;
    interval: CandleInterval;
    startTime: Date;
    endTimeExclusive: Date;
}): Promise<{
    openTime: Date;
    closeTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}[]>;
export {};
