import assert from "node:assert/strict";
import { processPaperCandle } from "../paper-trading.engine.js";
function createAccount(overrides = {}) {
    return {
        id: "paper-test",
        marketType: "SPOT",
        initialCapital: 1000,
        cash: 1000,
        assetQuantity: 0,
        averageEntryPrice: null,
        stopLossPrice: null,
        isolatedMargin: 0,
        realizedPnl: 0,
        equity: 1000,
        lastMarkPrice: null,
        peakEquity: 1000,
        dailyStartingEquity: 1000,
        currentDay: "2026-01-01",
        pendingAction: null,
        pendingReason: null,
        pendingStopLoss: null,
        pendingSignalOpenTime: null,
        lastProcessedOpenTime: null,
        leverage: 1,
        feeRate: 0.001,
        slippageRate: 0.0005,
        ...overrides
    };
}
function candle(openTime, open, low, close) {
    return {
        openTime: new Date(openTime),
        closeTime: new Date(new Date(openTime).getTime() + 3_599_999),
        open,
        high: Math.max(open, close),
        low,
        close,
        volume: 1
    };
}
const entryCandle = candle("2026-01-01T01:00:00.000Z", 100, 95, 101);
const spotEntry = processPaperCandle(createAccount({
    pendingAction: "BUY",
    pendingReason: "test entry",
    pendingStopLoss: 90
}), [], entryCandle);
assert.equal(spotEntry.trades.length, 1);
assert.equal(spotEntry.trades[0].action, "BUY");
assert.ok(spotEntry.account.cash < 1000);
assert.ok(spotEntry.account.assetQuantity > 0);
const spotExit = processPaperCandle({
    ...createAccount(),
    ...spotEntry.account,
    id: "paper-test",
    pendingAction: "SELL",
    pendingReason: "test exit"
}, [], candle("2026-01-01T02:00:00.000Z", 105, 104, 106));
assert.equal(spotExit.trades[0].action, "SELL");
assert.equal(spotExit.account.assetQuantity, 0);
assert.ok(spotExit.account.cash > 1000);
const futuresEntry = processPaperCandle(createAccount({
    marketType: "USD_M_FUTURES",
    pendingAction: "BUY",
    pendingReason: "test futures entry",
    pendingStopLoss: 90
}), [], entryCandle);
assert.equal(futuresEntry.trades[0].action, "BUY");
assert.ok(futuresEntry.account.isolatedMargin > 0);
assert.ok(futuresEntry.account.cash < 1000);
const funding = processPaperCandle(createAccount({
    marketType: "USD_M_FUTURES",
    cash: 900,
    assetQuantity: 1,
    averageEntryPrice: 100,
    stopLossPrice: 90,
    isolatedMargin: 100
}), [], candle("2026-01-01T08:00:00.000Z", 100, 99, 100), 0.001);
assert.equal(funding.trades[0].action, "FUNDING");
assert.equal(funding.trades[0].fundingAmount, -0.1);
assert.equal(funding.account.isolatedMargin, 99.9);
const liquidation = processPaperCandle(createAccount({
    marketType: "USD_M_FUTURES",
    cash: 900,
    assetQuantity: 1,
    averageEntryPrice: 100,
    stopLossPrice: 0.1,
    isolatedMargin: 100
}), [], candle("2026-01-01T09:00:00.000Z", 0.4, 0.3, 0.4));
assert.equal(liquidation.trades[0].action, "SELL");
assert.match(liquidation.trades[0].reason, /liquidation/);
assert.equal(liquidation.account.assetQuantity, 0);
assert.throws(() => processPaperCandle(createAccount({
    marketType: "USD_M_FUTURES",
    assetQuantity: 1,
    averageEntryPrice: 100,
    isolatedMargin: 100
}), [], candle("2026-01-01T08:00:00.000Z", 100, 99, 100)), /funding rate is required/);
console.log("Paper trading engine tests passed.");
//# sourceMappingURL=test-paper-trading.engine.js.map