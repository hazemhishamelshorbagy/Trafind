/**
 * What: Defines the database-ready shape of a mapped Binance candle.
 * Why: Keeps repository input types explicit and prevents interval or field mismatches.
 */
type CandleInterval = "M1" | "M5" | "H1";
export interface SaveCandleInput {
  symbol: string;
  interval: CandleInterval;
  openTime: Date;
  closeTime: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseVolume: string;
  takerBuyQuoteVolume: string;
}