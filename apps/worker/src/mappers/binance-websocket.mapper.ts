/**
 * What: Converts Binance WebSocket kline fields into a REST-compatible kline array.
 * Why: Lets one shared mapper normalize historical and live candle payloads.
 */
import { BinanceKline, BinanceWebSocketMessage } from "../types/market.types.js";




export function mapWebSocketMessageToKline(
  message: BinanceWebSocketMessage
): BinanceKline {
  const k = message.k;

  return [
    k.t,
    k.o,
    k.h,
    k.l,
    k.c,
    k.v,
    k.T,
    k.q,
    k.n,
    k.V,
    k.Q,
    "0"
  ];
}