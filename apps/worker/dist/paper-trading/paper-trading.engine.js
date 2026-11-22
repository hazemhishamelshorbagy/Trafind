import { emaTrendPullbackStrategy } from "../backtesting/strategies/ema-trend-pullback.strategy.js";
const RISK_PER_TRADE = 0.01;
const MAX_DAILY_LOSS = 0.03;
const MAX_DRAWDOWN = 0.1;
const MINIMUM_MAINTENANCE_MARGIN_RATE = 0.005;
function markEquity(account, price) {
    const unrealizedPnl = account.averageEntryPrice === null
        ? 0
        : (price - account.averageEntryPrice) * account.assetQuantity;
    return account.marketType === "SPOT"
        ? account.cash + account.assetQuantity * price
        : account.cash + account.isolatedMargin + unrealizedPnl;
}
function liquidationPrice(account) {
    if (account.marketType !== "USD_M_FUTURES" ||
        account.averageEntryPrice === null) {
        return null;
    }
    return account.averageEntryPrice *
        (1 - 1 / account.leverage + MINIMUM_MAINTENANCE_MARGIN_RATE) /
        (1 - MINIMUM_MAINTENANCE_MARGIN_RATE);
}
export function processPaperCandle(account, history, candle, fundingRate) {
    if (account.marketType === "USD_M_FUTURES" &&
        account.leverage !== 1) {
        throw new Error("Paper USD-M Futures accounts must use 1x leverage");
    }
    if (!Number.isFinite(candle.open) ||
        !Number.isFinite(candle.low) ||
        !Number.isFinite(candle.close) ||
        candle.open <= 0 ||
        candle.low <= 0 ||
        candle.close <= 0) {
        throw new Error("Invalid candle prices for paper execution");
    }
    const next = { ...account };
    const trades = [];
    const day = candle.openTime.toISOString().slice(0, 10);
    function recordTrade(action, executionPrice, quantity, fee, fundingAmount, realizedPnl, reason) {
        trades.push({
            accountId: account.id,
            candleOpenTime: candle.openTime,
            action,
            executionPrice,
            quantity,
            fee,
            fundingAmount,
            realizedPnl,
            reason
        });
    }
    function closeLong(expectedPrice, reason) {
        if (next.assetQuantity <= 0 || next.averageEntryPrice === null) {
            return;
        }
        const executionPrice = expectedPrice * (1 - next.slippageRate);
        const quantity = next.assetQuantity;
        const fee = executionPrice * quantity * next.feeRate;
        const grossPnl = (executionPrice - next.averageEntryPrice) * quantity;
        if (next.marketType === "SPOT") {
            next.cash += executionPrice * quantity - fee;
        }
        else {
            next.cash += next.isolatedMargin + grossPnl - fee;
            next.isolatedMargin = 0;
        }
        const realizedPnl = grossPnl - fee;
        next.realizedPnl += realizedPnl;
        recordTrade("SELL", executionPrice, quantity, fee, 0, realizedPnl, reason);
        next.assetQuantity = 0;
        next.averageEntryPrice = null;
        next.stopLossPrice = null;
    }
    if (next.marketType === "USD_M_FUTURES" &&
        next.assetQuantity > 0 &&
        candle.openTime.getUTCHours() % 8 === 0) {
        if (fundingRate === undefined || !Number.isFinite(fundingRate)) {
            throw new Error("A valid Binance funding rate is required");
        }
        const fundingAmount = -next.assetQuantity * candle.open * fundingRate;
        next.isolatedMargin += fundingAmount;
        next.realizedPnl += fundingAmount;
        recordTrade("FUNDING", candle.open, next.assetQuantity, 0, fundingAmount, fundingAmount, `Binance funding rate ${fundingRate}`);
    }
    if (day !== next.currentDay) {
        next.currentDay = day;
        next.dailyStartingEquity = markEquity(next, candle.open);
    }
    if (next.pendingAction === "SELL" && next.assetQuantity > 0) {
        closeLong(candle.open, next.pendingReason ?? "Strategy exit");
    }
    else if (next.pendingAction === "BUY" &&
        next.assetQuantity === 0 &&
        next.pendingStopLoss !== null &&
        next.pendingStopLoss > 0 &&
        next.pendingStopLoss < candle.open) {
        const executionPrice = candle.open * (1 + next.slippageRate);
        const stopExecutionPrice = next.pendingStopLoss * (1 - next.slippageRate);
        const riskPerUnit = executionPrice * (1 + next.feeRate) -
            stopExecutionPrice * (1 - next.feeRate);
        const equityAtEntry = markEquity(next, candle.open);
        const drawdown = (next.peakEquity - equityAtEntry) / next.peakEquity;
        const dailyLoss = (next.dailyStartingEquity - equityAtEntry) /
            next.dailyStartingEquity;
        if (riskPerUnit > 0 &&
            equityAtEntry > 0 &&
            drawdown < MAX_DRAWDOWN &&
            dailyLoss < MAX_DAILY_LOSS) {
            const riskQuantity = equityAtEntry * RISK_PER_TRADE / riskPerUnit;
            const capitalPerUnit = executionPrice *
                (next.marketType === "SPOT" ? 1 + next.feeRate : 1 / next.leverage + next.feeRate);
            const capitalQuantity = next.cash / capitalPerUnit;
            const quantity = Math.min(riskQuantity, capitalQuantity);
            if (quantity > 0 && Number.isFinite(quantity)) {
                const notional = executionPrice * quantity;
                const fee = notional * next.feeRate;
                if (next.marketType === "SPOT") {
                    next.cash -= notional + fee;
                }
                else {
                    const margin = notional / next.leverage;
                    next.cash -= margin + fee;
                    next.isolatedMargin += margin;
                }
                next.assetQuantity = quantity;
                next.averageEntryPrice = executionPrice;
                next.stopLossPrice = next.pendingStopLoss;
                next.realizedPnl -= fee;
                recordTrade("BUY", executionPrice, quantity, fee, 0, -fee, next.pendingReason ?? "Strategy entry");
            }
        }
    }
    next.pendingAction = null;
    next.pendingReason = null;
    next.pendingStopLoss = null;
    next.pendingSignalOpenTime = null;
    const estimatedLiquidationPrice = liquidationPrice(next);
    if (estimatedLiquidationPrice !== null &&
        candle.open <= estimatedLiquidationPrice &&
        candle.low <= estimatedLiquidationPrice) {
        closeLong(estimatedLiquidationPrice, "Estimated 0.5% maintenance-margin liquidation");
    }
    else if (next.assetQuantity > 0 &&
        next.stopLossPrice !== null &&
        candle.low <= next.stopLossPrice) {
        const expectedStopPrice = candle.open < next.stopLossPrice ? candle.open : next.stopLossPrice;
        closeLong(expectedStopPrice, "ATR stop-loss triggered");
    }
    else if (estimatedLiquidationPrice !== null &&
        candle.low <= estimatedLiquidationPrice) {
        closeLong(estimatedLiquidationPrice, "Estimated 0.5% maintenance-margin liquidation");
    }
    const signal = emaTrendPullbackStrategy.analyze(history);
    if (signal.action !== "HOLD") {
        next.pendingAction = signal.action;
        next.pendingReason = signal.reason;
        next.pendingStopLoss = signal.stopLoss ?? null;
        next.pendingSignalOpenTime = candle.openTime;
    }
    next.lastMarkPrice = candle.close;
    next.equity = markEquity(next, candle.close);
    next.peakEquity = Math.max(next.peakEquity, next.equity);
    const { id: _id, ...accountSnapshot } = next;
    return {
        account: accountSnapshot,
        trades
    };
}
//# sourceMappingURL=paper-trading.engine.js.map