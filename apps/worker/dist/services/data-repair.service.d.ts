/**
 * What: Finds database gaps, recollects them, and verifies repair results.
 * Why: Turns detected quality problems into a completed and checked recovery range.
 */
import { BinanceInterval } from "../types/market.types.js";
interface RepairParams {
    symbol: string;
    interval: BinanceInterval;
    startTime: Date;
    endTime: Date;
}
export declare function repairMissingCandles({ symbol, interval, startTime, endTime }: RepairParams): Promise<{
    repaired: number;
    remaining: number;
}>;
export {};
