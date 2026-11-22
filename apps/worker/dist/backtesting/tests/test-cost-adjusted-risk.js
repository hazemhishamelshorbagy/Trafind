import assert from "node:assert/strict";
import { defaultBacktestConfig } from "../backtest.config.js";
import { runBacktestEngine } from "../backtest-engine.js";
const strategy = {
    name: "Cost-adjusted risk test",
    analyze(candles) {
        if (candles.length === 1) {
            return {
                action: "BUY",
                reason: "Test entry",
                stopLoss: 95
            };
        }
        return {
            action: "HOLD",
            reason: "No further signal"
        };
    }
};
const candles = [
    {
        openTime: new Date("2026-01-01T00:00:00.000Z"),
        closeTime: new Date("2026-01-01T00:59:59.999Z"),
        open: 100,
        high: 101,
        low: 99,
        close: 100,
        volume: 1
    },
    {
        openTime: new Date("2026-01-01T01:00:00.000Z"),
        closeTime: new Date("2026-01-01T01:59:59.999Z"),
        open: 100,
        high: 101,
        low: 95,
        close: 98,
        volume: 1
    }
];
const result = runBacktestEngine({
    candles,
    strategy,
    config: defaultBacktestConfig
});
assert.equal(result.trades.length, 1);
assert.ok(result.trades[0].pnl >= -10);
assert.ok(result.trades[0].pnl < 0);
console.log("Cost-adjusted risk test passed.");
//# sourceMappingURL=test-cost-adjusted-risk.js.map