export type TradingAction = "BUY" | "SELL" | "HOLD";

export interface TradingSignal {
  action: TradingAction;
  reason: string;
  stopLoss?: number;
}

export interface Candle {
  openTime: Date;
  closeTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Strategy {
  name: string;
  analyze(candles: Candle[]): TradingSignal;
}