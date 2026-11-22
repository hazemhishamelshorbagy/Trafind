import type { BinanceKline, GetKlinesParams } from "../types/market.types.js";
export declare function buildBinanceKlinesUrl({ symbol, interval, marketType, limit, startTime, endTime }: GetKlinesParams): string;
export declare function getKlines({ symbol, interval, marketType, limit, startTime, endTime }: GetKlinesParams): Promise<BinanceKline[]>;
