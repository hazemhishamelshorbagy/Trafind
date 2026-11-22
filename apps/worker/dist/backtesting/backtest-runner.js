export function runBacktest({ candles, strategy }) {
    const signals = [];
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
//# sourceMappingURL=backtest-runner.js.map