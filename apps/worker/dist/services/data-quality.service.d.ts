import { BinanceInterval } from "../types/market.types.js";
export declare function detectMissingCandles(openTimes: Date[], intervalDuration: number): Date[];
export declare function areCandleTimesSorted(openTimes: Date[]): boolean;
export declare function areCandleDatesValid(openTimes: Date[]): boolean;
export declare function checkCandleData(openTimes: Date[], intervalDuration: number): Date[];
interface CheckDatabaseParams {
    symbol: string;
    interval: BinanceInterval;
    startTime: Date;
    endTime: Date;
}
export declare function checkDatabaseCandleQuality({ symbol, interval, startTime, endTime, }: CheckDatabaseParams): Promise<{
    symbol: string;
    interval: BinanceInterval;
    checkedCandles: number;
    missingCandles: Date[];
}>;
export declare function detectTrailingMissingCandles(latestOpenTime: Date, intervalDuration: number, now?: Date): Date[];
export declare function detectMissingCandlesInRange(openTimes: Date[], startTime: Date, endTime: Date, intervalDuration: number): Date[];
export {};
