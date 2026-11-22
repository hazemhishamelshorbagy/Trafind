import { analyzePerformance } from "../performance-analyzer.js";
const report = analyzePerformance({
    initialCapital: 1000,
    finalEquity: 1100,
    trades: [
        {
            entryPrice: 100,
            exitPrice: 120,
            quantity: 1,
            pnl: 20,
            entryTime: new Date("2026-01-01"),
            exitTime: new Date("2026-01-02"),
            exitReason: "STRATEGY_EXIT"
        },
        {
            entryPrice: 120,
            exitPrice: 110,
            quantity: 1,
            pnl: -10,
            entryTime: new Date("2026-01-03"),
            exitTime: new Date("2026-01-04"),
            exitReason: "STRATEGY_EXIT"
        },
        {
            entryPrice: 110,
            exitPrice: 130,
            quantity: 1,
            pnl: 20,
            entryTime: new Date("2026-01-05"),
            exitTime: new Date("2026-01-06"),
            exitReason: "STRATEGY_EXIT"
        }
    ],
    equityCurve: [
        { time: new Date("2026-01-01"), equity: 1000 },
        { time: new Date("2026-01-02"), equity: 1020 },
        { time: new Date("2026-01-03"), equity: 1010 },
        { time: new Date("2026-01-04"), equity: 1050 },
        { time: new Date("2026-01-05"), equity: 1100 }
    ]
});
console.log("Performance Report:", report);
//# sourceMappingURL=test-performance-analyzer.js.map