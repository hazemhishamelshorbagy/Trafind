import { BinanceInterval } from "../types/market.types.js";
interface HistoricalDataParams {
    symbol: string;
    interval: BinanceInterval;
    startTime: number;
    endTime: number;
    resumeFromLatest?: boolean;
}
export declare function collectAndSaveHistoricalData({ symbol, interval, startTime, endTime, resumeFromLatest, }: HistoricalDataParams): Promise<{
    totalReceived: number;
    totalValid: number;
    totalSaved: number;
    totalSkipped: number;
}>;
export {};
