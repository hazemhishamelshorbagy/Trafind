import { createPortfolio, calculatePortfolioValue, buyAsset, sellAsset, } from "./portfolio-simulator.js";
import { simulateExecution } from "./execution-simulator.js";
import { createRiskManager } from "./risk/risk-manager.js";
import { createTradeRecorder } from "./trade-recorder.js";
import { analyzePerformance } from "./performance-analyzer.js";
export function runBacktestEngine({ candles, strategy, config, }) {
    if (candles.length < 2) {
        throw new Error("At least two candles are required");
    }
    let portfolio = createPortfolio(config.initialCapital);
    const riskManager = createRiskManager({
        riskPerTrade: config.riskPerTrade,
        maxOpenPositions: config.maxOpenPositions,
        maxDailyLoss: config.maxDailyLoss,
        maxDrawdown: config.maxDrawdown,
    });
    const recorder = createTradeRecorder();
    const equityCurve = [
        {
            time: candles[0].openTime,
            equity: config.initialCapital,
        },
    ];
    let peakEquity = config.initialCapital;
    let dailyStartingEquity = config.initialCapital;
    let currentDay = candles[0].openTime.toISOString().slice(0, 10);
    let activeStopLoss = null;
    let pendingSignal = null;
    function updateDay(time) {
        const day = time.toISOString().slice(0, 10);
        if (day !== currentDay) {
            currentDay = day;
            dailyStartingEquity = portfolio.equity;
        }
    }
    function closePosition(expectedPrice, time, exitReason) {
        if (!recorder.hasOpenTrade())
            return;
        const quantity = portfolio.assetQuantity;
        const execution = simulateExecution("SELL", expectedPrice, config.slippageRate, quantity, config.feeRate);
        portfolio = sellAsset(portfolio, execution, execution.executionPrice);
        recorder.close(execution.executionPrice, execution.fee, time, exitReason);
        activeStopLoss = null;
    }
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        updateDay(candle.openTime);
        // 1. Execute the previous candle's signal at this candle's open.
        if (i > 0 && pendingSignal) {
            if (pendingSignal.action === "BUY" && !recorder.hasOpenTrade()) {
                const expectedEntryPrice = candle.open;
                const stopLoss = pendingSignal.stopLoss;
                if (stopLoss !== undefined &&
                    stopLoss > 0 &&
                    stopLoss < expectedEntryPrice) {
                    const expectedEntryExecutionPrice = expectedEntryPrice * (1 + config.slippageRate);
                    const expectedStopExecutionPrice = stopLoss * (1 - config.slippageRate);
                    const riskPerUnit = expectedEntryExecutionPrice * (1 + config.feeRate) -
                        expectedStopExecutionPrice * (1 - config.feeRate);
                    const riskDecision = riskManager.evaluateRisk({
                        equity: calculatePortfolioValue(portfolio, expectedEntryPrice).equity,
                        dailyStartingEquity,
                        peakEquity,
                        openPositions: recorder.hasOpenTrade() ? 1 : 0,
                    }, expectedEntryPrice, stopLoss, riskPerUnit);
                    if (riskDecision.approved) {
                        const affordableQuantity = (portfolio.cash /
                            (expectedEntryPrice *
                                (1 + config.slippageRate) *
                                (1 + config.feeRate))) * (1 - 1e-10);
                        const quantity = Math.min(riskDecision.quantity, affordableQuantity);
                        if (quantity > 0) {
                            const execution = simulateExecution("BUY", expectedEntryPrice, config.slippageRate, quantity, config.feeRate);
                            portfolio = buyAsset(portfolio, execution, execution.executionPrice);
                            recorder.open({
                                entryPrice: execution.executionPrice,
                                quantity,
                                entryFee: execution.fee,
                                entryTime: candle.openTime,
                            });
                            activeStopLoss = stopLoss;
                        }
                    }
                }
            }
            // Strategy requested an exit.
            if (pendingSignal.action === "SELL" && recorder.hasOpenTrade()) {
                closePosition(candle.open, candle.openTime, "STRATEGY_EXIT");
            }
        }
        pendingSignal = null;
        // 2. Check whether the current candle hit the stop loss.
        if (recorder.hasOpenTrade() &&
            activeStopLoss !== null &&
            candle.low <= activeStopLoss) {
            // If price gaps below the stop, use the candle open.
            const stopExecutionPrice = candle.open < activeStopLoss
                ? candle.open
                : activeStopLoss;
            closePosition(stopExecutionPrice, candle.closeTime, "STOP_LOSS");
        }
        // 3. Mark the portfolio to market at candle close.
        portfolio = calculatePortfolioValue(portfolio, candle.close);
        peakEquity = Math.max(peakEquity, portfolio.equity);
        equityCurve.push({
            time: candle.closeTime,
            equity: portfolio.equity,
        });
        // 4. Generate a signal using candles available so far.
        if (i < candles.length - 1) {
            pendingSignal = strategy.analyze(candles.slice(0, i + 1));
        }
    }
    // 5. Close any remaining position at the final candle's close.
    if (recorder.hasOpenTrade()) {
        closePosition(candles[candles.length - 1].close, candles[candles.length - 1].closeTime, "END_OF_BACKTEST");
        equityCurve[equityCurve.length - 1].equity = portfolio.equity;
    }
    const trades = recorder.getClosedTrades();
    const performance = analyzePerformance({
        initialCapital: config.initialCapital,
        finalEquity: portfolio.equity,
        trades,
        equityCurve,
    });
    return {
        strategyName: strategy.name,
        totalCandles: candles.length,
        finalPortfolio: portfolio,
        trades,
        equityCurve,
        performance,
    };
}
//# sourceMappingURL=backtest-engine.js.map