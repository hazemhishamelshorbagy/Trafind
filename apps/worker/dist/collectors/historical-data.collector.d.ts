import { BinanceKline, HistoricalDataParams } from "../types/market.types.js";
export declare function collectHistoricalKlines({ symbol, interval, startTime, endTime }: HistoricalDataParams): AsyncGenerator<BinanceKline[]>;
