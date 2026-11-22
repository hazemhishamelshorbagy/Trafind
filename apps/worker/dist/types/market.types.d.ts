/**
 * What: Defines shared Binance REST, WebSocket, interval, and mapped-candle types.
 * Why: Gives ingestion code a consistent, typed contract for external market data.
 */
export type BinanceInterval = "1m" | "5m" | "1h";
export type BinanceMarketType = "SPOT" | "USD_M_FUTURES";
export type BinanceKline = [
    number,
    string,
    string,
    string,
    string,
    string,
    number,
    string,
    number,
    string,
    string,
    string
];
export interface GetKlinesParams {
    symbol: string;
    interval: BinanceInterval;
    marketType?: BinanceMarketType;
    limit?: number;
    startTime?: number;
    endTime?: number;
}
export type MappedCandle = {
    symbol: string;
    interval: "1m" | "5m" | "1h";
    openTime: Date;
    closeTime: Date;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    quoteAssetVolume: string;
    numberOfTrades: number;
    takerBuyBaseVolume: string;
    takerBuyQuoteVolume: string;
};
export interface HistoricalDataParams {
    symbol: string;
    interval: BinanceInterval;
    marketType?: BinanceMarketType;
    startTime: number;
    endTime: number;
}
export declare const INTERVAL_DURATION: Record<BinanceInterval, number>;
export interface BinanceWebSocketMessage {
    e: string;
    s: string;
    k: {
        t: number;
        T: number;
        s: string;
        i: "1m" | "5m" | "1h";
        o: string;
        c: string;
        h: string;
        l: string;
        v: string;
        n: number;
        x: boolean;
        q: string;
        V: string;
        Q: string;
    };
}
