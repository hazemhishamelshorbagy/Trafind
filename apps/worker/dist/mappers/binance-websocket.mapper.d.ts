/**
 * What: Converts Binance WebSocket kline fields into a REST-compatible kline array.
 * Why: Lets one shared mapper normalize historical and live candle payloads.
 */
import { BinanceKline, BinanceWebSocketMessage } from "../types/market.types.js";
export declare function mapWebSocketMessageToKline(message: BinanceWebSocketMessage): BinanceKline;
