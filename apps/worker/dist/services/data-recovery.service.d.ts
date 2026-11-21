import { BinanceInterval } from "../types/market.types.js";
interface RecoveryParams {
    symbol: string;
    interval: BinanceInterval;
}
export declare function recoverMissingCandles({ symbol, interval }: RecoveryParams): Promise<void>;
export {};
