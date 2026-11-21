/**
 * What: Validates candle values and detects whether a candle is already closed.
 * Why: Prevents malformed or incomplete market data from entering PostgreSQL.
 */
import { MappedCandle } from "../types/market.types.js";
export declare function validateCandle(candle: MappedCandle): boolean;
export declare function isCandleClosed(candle: MappedCandle): boolean;
