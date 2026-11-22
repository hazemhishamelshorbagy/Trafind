import { BinanceInterval } from "../types/market.types.js";
interface HistoricalDataParams {
    symbol: string;
    interval: BinanceInterval;
    marketType?: "SPOT" | "USD_M_FUTURES";
    startTime: number;
    endTime: number;
    resumeFromLatest?: boolean;
}
export declare function collectAndSaveHistoricalData({ symbol, interval, marketType, startTime, endTime, resumeFromLatest, }: HistoricalDataParams): Promise<{
    totalReceived: number;
    totalValid: number;
    totalSaved: number;
    totalSkipped: number;
}>;
export {};
