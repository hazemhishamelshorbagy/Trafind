import type {
  Candle,
  Strategy,
  TradingSignal
} from "./backtest.types.js";

interface BacktestResult {
  strategyName: string;
  totalCandles: number;
  signals: {
    candleTime: Date;
    signal: TradingSignal;
  }[];
}

interface RunBacktestInput {
  candles: Candle[];
  strategy: Strategy;
}

export function runBacktest({
  candles,
  strategy
}: RunBacktestInput): BacktestResult {
  const signals: BacktestResult["signals"] = [];

  for (let i = 0; i < candles.length; i++) {
    const availableCandles = candles.slice(0, i + 1);

    const signal = strategy.analyze(availableCandles);

    signals.push({
      candleTime: candles[i].closeTime,
      signal
    });
  }

  return {
    strategyName: strategy.name,
    totalCandles: candles.length,
    signals
  };
}