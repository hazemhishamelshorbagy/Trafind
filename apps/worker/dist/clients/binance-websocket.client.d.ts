import { BinanceInterval, BinanceMarketType } from "../types/market.types.js";
export interface BinanceWebSocketOptions {
    symbol?: string;
    interval?: BinanceInterval;
    marketType?: BinanceMarketType;
}
export declare function buildBinanceWebSocketUrl({ symbol, interval, marketType }?: BinanceWebSocketOptions): string;
export declare function connectBinanceWebSocket(options?: BinanceWebSocketOptions): {
    close(): void;
};
