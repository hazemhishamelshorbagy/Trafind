import { BinanceInterval, BinanceMarketType } from "../types/market.types.js";
interface RecoveryParams {
    symbol: string;
    interval: BinanceInterval;
    marketType?: BinanceMarketType;
}
export declare function recoverMissingCandles({ symbol, interval, marketType }: RecoveryParams): Promise<void>;
export {};
