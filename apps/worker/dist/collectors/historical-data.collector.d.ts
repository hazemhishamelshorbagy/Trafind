import { BinanceKline, HistoricalDataParams } from "../types/market.types.js";
export declare function collectHistoricalKlines({ symbol, interval, marketType, startTime, endTime }: HistoricalDataParams): AsyncGenerator<BinanceKline[]>;
