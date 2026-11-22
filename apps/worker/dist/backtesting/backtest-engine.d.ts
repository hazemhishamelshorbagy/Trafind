import type { Candle, Strategy } from "./backtest.types.js";
import type { BacktestConfig } from "./backtest.config.js";
interface BacktestEngineInput {
    candles: Candle[];
    strategy: Strategy;
    config: BacktestConfig;
}
export declare function runBacktestEngine({ candles, strategy, config, }: BacktestEngineInput): {
    strategyName: string;
    totalCandles: number;
    finalPortfolio: import("./portfolio-simulator.js").Portfolio;
    trades: import("./performance.types.js").ClosedTrade[];
    equityCurve: {
        time: Date;
        equity: number;
    }[];
    performance: import("./performance.types.js").PerformanceReport;
};
export {};
