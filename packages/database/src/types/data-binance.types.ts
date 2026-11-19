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