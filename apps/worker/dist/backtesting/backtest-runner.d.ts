import type { Candle, Strategy, TradingSignal } from "./backtest.types.js";
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
export declare function runBacktest({ candles, strategy }: RunBacktestInput): BacktestResult;
export {};
