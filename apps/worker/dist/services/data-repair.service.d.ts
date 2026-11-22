/**
 * What: Finds database gaps, recollects them, and verifies repair results.
 * Why: Turns detected quality problems into a completed and checked recovery range.
 */
import { BinanceInterval, BinanceMarketType } from "../types/market.types.js";
interface RepairParams {
    symbol: string;
    interval: BinanceInterval;
    marketType?: BinanceMarketType;
    startTime: Date;
    endTime: Date;
}
export declare function repairMissingCandles({ symbol, interval, marketType, startTime, endTime }: RepairParams): Promise<{
    repaired: number;
    remaining: number;
}>;
export {};
