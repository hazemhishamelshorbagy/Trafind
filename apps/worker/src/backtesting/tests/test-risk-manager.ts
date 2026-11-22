import { createRiskManager } from "../risk/risk-manager.js";

const riskManager = createRiskManager({
  riskPerTrade: 0.01,
  maxOpenPositions: 1,
  maxDailyLoss: 0.03,
  maxDrawdown: 0.10
});

// Test 1: Position Size
const quantity = riskManager.calculatePositionSize({
  equity: 1000,
  entryPrice: 100,
  stopLoss: 95,
  riskPerTrade: 0.01
});

console.log("Position Size:", quantity, "SOL");

// Test 2: Approved Trade
const approved = riskManager.evaluateRisk(
  {
    equity: 1000,
    dailyStartingEquity: 1000,
    peakEquity: 1000,
    openPositions: 0
  },
  100,
  95
);

console.log("Approved Trade:", approved);

// Test 3: Maximum Open Positions
const rejectedPosition = riskManager.evaluateRisk(
  {
    equity: 1000,
    dailyStartingEquity: 1000,
    peakEquity: 1000,
    openPositions: 1
  },
  100,
  95
);

console.log("Rejected Position:", rejectedPosition);

// Test 4: Maximum Daily Loss
const rejectedDailyLoss = riskManager.evaluateRisk(
  {
    equity: 970,
    dailyStartingEquity: 1000,
    peakEquity: 1000,
    openPositions: 0
  },
  100,
  95
);

console.log("Rejected Daily Loss:", rejectedDailyLoss);

// Test 5: Maximum Drawdown
const rejectedDrawdown = riskManager.evaluateRisk(
  {
       equity: 900,
    dailyStartingEquity: 950,
    peakEquity: 1000,
    openPositions: 0
  },
  100,
  95
);

console.log("Rejected Drawdown:", rejectedDrawdown);