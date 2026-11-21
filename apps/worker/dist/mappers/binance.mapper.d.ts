/**
 * What: Converts a Binance REST kline array into a normalized candle object.
 * Why: Separates external array indexes from the application's candle representation.
 */
import type { MappedCandle, BinanceKline } from "../types/market.types.js";
export declare function mapBinanceKline(kline: BinanceKline, symbol: string, interval: "1m" | "5m" | "1h"): MappedCandle;
