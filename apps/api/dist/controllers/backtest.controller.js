import { findBacktestRun, findCandlesByTimeRange, findLatestBacktestRuns, saveBacktestRun } from "@trafind/database";
import { calculateBuyAndHoldBenchmark } from "@trafind/worker/backtesting/buy-and-hold-benchmark";
import { defaultBacktestConfig } from "@trafind/worker/backtesting/backtest.config";
import { runBacktestEngine } from "@trafind/worker/backtesting/backtest-engine";
import { emaTrendPullbackStrategy } from "@trafind/worker/backtesting/strategies/ema-trend-pullback.strategy";
import { backtestHistoryQuerySchema, backtestRequestSchema } from "../schemas/backtest.schema.js";
const ONE_HOUR_MS = 60 * 60 * 1000;
export const createBacktest = async (req, res, next) => {
    const parsed = backtestRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            error: {
                message: "Invalid backtest request",
                details: parsed.error.issues
            }
        });
        return;
    }
    const startTime = new Date(parsed.data.startTime);
    const endTimeExclusive = new Date(parsed.data.endTimeExclusive);
    const expectedCandleCount = (endTimeExclusive.getTime() - startTime.getTime()) / ONE_HOUR_MS;
    try {
        const storedCandles = await findCandlesByTimeRange(parsed.data.symbol, "H1", startTime, endTimeExclusive);
        if (storedCandles.length !== expectedCandleCount) {
            res.status(422).json({
                success: false,
                error: {
                    message: "Historical range is incomplete",
                    expectedCandles: expectedCandleCount,
                    actualCandles: storedCandles.length
                }
            });
            return;
        }
        const candles = storedCandles.map((candle) => ({
            openTime: candle.openTime,
            closeTime: candle.closeTime,
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
            volume: Number(candle.volume)
        }));
        for (let index = 0; index < candles.length; index++) {
            const expectedOpenTime = startTime.getTime() + index * ONE_HOUR_MS;
            if (candles[index].openTime.getTime() !== expectedOpenTime) {
                res.status(422).json({
                    success: false,
                    error: {
                        message: "Historical range contains a missing or misaligned candle",
                        expectedOpenTime: new Date(expectedOpenTime).toISOString(),
                        actualOpenTime: candles[index].openTime.toISOString()
                    }
                });
                return;
            }
        }
        const config = {
            ...defaultBacktestConfig,
            initialCapital: parsed.data.initialCapital
        };
        const backtest = runBacktestEngine({
            candles,
            strategy: emaTrendPullbackStrategy,
            config
        });
        const buyAndHold = calculateBuyAndHoldBenchmark({
            candles,
            initialCapital: config.initialCapital,
            feeRate: config.feeRate,
            slippageRate: config.slippageRate
        });
        const performance = {
            totalTrades: backtest.performance.totalTrades,
            winningTrades: backtest.performance.winningTrades,
            losingTrades: backtest.performance.losingTrades,
            winRate: backtest.performance.winRate,
            totalReturn: backtest.performance.totalReturn,
            maxDrawdown: backtest.performance.maxDrawdown,
            profitFactor: backtest.performance.profitFactor,
            netProfit: backtest.performance.netProfit
        };
        const result = {
            strategyName: backtest.strategyName,
            totalCandles: backtest.totalCandles,
            finalPortfolio: {
                cash: backtest.finalPortfolio.cash,
                assetQuantity: backtest.finalPortfolio.assetQuantity,
                equity: backtest.finalPortfolio.equity,
                unrealizedPnL: backtest.finalPortfolio.unrealizedPnL,
                averageEntryPrice: backtest.finalPortfolio.averageEntryPrice,
                realizedPnL: backtest.finalPortfolio.realizedPnL
            },
            trades: backtest.trades.map((trade) => ({
                ...trade,
                entryTime: trade.entryTime.toISOString(),
                exitTime: trade.exitTime.toISOString()
            })),
            equityCurve: backtest.equityCurve.map((point) => ({
                time: point.time.toISOString(),
                equity: point.equity
            })),
            buyAndHold: {
                entryPrice: buyAndHold.entryPrice,
                exitPrice: buyAndHold.exitPrice,
                quantity: buyAndHold.quantity,
                finalEquity: buyAndHold.finalEquity,
                totalReturn: buyAndHold.totalReturn
            }
        };
        const configuration = {
            initialCapital: config.initialCapital,
            feeRate: config.feeRate,
            slippageRate: config.slippageRate,
            riskPerTrade: config.riskPerTrade,
            maxOpenPositions: config.maxOpenPositions,
            maxDailyLoss: config.maxDailyLoss,
            maxDrawdown: config.maxDrawdown,
            strategy: "ema-trend-pullback",
            executionMarket: "spot"
        };
        const savedRun = await saveBacktestRun({
            symbol: parsed.data.symbol,
            interval: "H1",
            strategyName: backtest.strategyName,
            startTime,
            endTimeExclusive,
            initialCapital: config.initialCapital,
            finalEquity: backtest.finalPortfolio.equity,
            totalCandles: backtest.totalCandles,
            tradeCount: backtest.trades.length,
            configuration,
            performance,
            result
        });
        res.status(201).json({
            success: true,
            data: {
                id: savedRun.id,
                symbol: savedRun.symbol,
                interval: "1h",
                strategyName: savedRun.strategyName,
                startTime: savedRun.startTime.toISOString(),
                endTimeExclusive: savedRun.endTimeExclusive.toISOString(),
                initialCapital: Number(savedRun.initialCapital),
                finalEquity: Number(savedRun.finalEquity),
                totalCandles: savedRun.totalCandles,
                tradeCount: savedRun.tradeCount,
                performance: savedRun.performance,
                result: savedRun.result,
                createdAt: savedRun.createdAt.toISOString()
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const getBacktestHistory = async (req, res, next) => {
    const parsed = backtestHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            error: {
                message: "Invalid backtest history query",
                details: parsed.error.issues
            }
        });
        return;
    }
    try {
        const runs = await findLatestBacktestRuns(parsed.data.limit);
        res.status(200).json({
            success: true,
            data: runs.map((run) => ({
                ...run,
                interval: "1h",
                startTime: run.startTime.toISOString(),
                endTimeExclusive: run.endTimeExclusive.toISOString(),
                initialCapital: Number(run.initialCapital),
                finalEquity: Number(run.finalEquity),
                createdAt: run.createdAt.toISOString()
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
export const getBacktest = async (req, res, next) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const isValidId = id !== undefined &&
        /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id);
    if (!isValidId || id === undefined) {
        res.status(400).json({
            success: false,
            error: { message: "Invalid backtest run ID" }
        });
        return;
    }
    try {
        const run = await findBacktestRun(id);
        if (!run) {
            res.status(404).json({
                success: false,
                error: { message: "Backtest run not found" }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...run,
                interval: "1h",
                startTime: run.startTime.toISOString(),
                endTimeExclusive: run.endTimeExclusive.toISOString(),
                initialCapital: Number(run.initialCapital),
                finalEquity: Number(run.finalEquity),
                createdAt: run.createdAt.toISOString()
            }
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=backtest.controller.js.map