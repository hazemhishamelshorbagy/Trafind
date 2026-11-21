/**
 * What: Defines shared Binance REST, WebSocket, interval, and mapped-candle types.
 * Why: Gives ingestion code a consistent, typed contract for external market data.
 */
export type BinanceInterval = "1m" | "5m" | "1h";

export type BinanceKline = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base volume
  string, // Taker buy quote volume
  string  // Ignore
];

export interface GetKlinesParams {
  symbol: string;
  interval: BinanceInterval;
  limit?: number;
  startTime?: number;
  endTime?: number;
}

export type MappedCandle= {
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
}
export interface HistoricalDataParams {
  symbol: string;
  interval: BinanceInterval;
  startTime: number;
  endTime: number;
}

export const INTERVAL_DURATION: Record<BinanceInterval, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "1h": 3_600_000
};
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