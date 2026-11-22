import { BinanceWebSocketMessage } from "../types/market.types.js";
import { BinanceMarketType } from "../types/market.types.js";
export declare function processLiveCandle(message: BinanceWebSocketMessage, marketType?: BinanceMarketType): Promise<void>;
