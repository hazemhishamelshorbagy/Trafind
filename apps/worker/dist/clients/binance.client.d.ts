import type { GetKlinesParams, BinanceKline } from "../types/market.types.js";
export declare function getKlines({ symbol, interval, limit, startTime, endTime }: GetKlinesParams): Promise<BinanceKline[]>;
