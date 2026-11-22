import { createPortfolio, calculatePortfolioValue, buyAsset, sellAsset } from "../portfolio-simulator.js";
import { simulateExecution } from "../execution-simulator.js";
// 1. Start
let portfolio = createPortfolio(1000);
console.log("Initial:", portfolio);
// 2. BUY 2 SOL at expected price 100
const buyExecution = simulateExecution("BUY", 100, 0.001, 2, 0.001);
portfolio = buyAsset(portfolio, buyExecution, 120);
console.log("After BUY:", portfolio);
// 3. Market price rises to 120
portfolio = calculatePortfolioValue(portfolio, 120);
console.log("After Price Increase:", portfolio);
// 4. SELL 1 SOL at expected price 120
const sellExecution = simulateExecution("SELL", 120, 0.001, 1, 0.001);
portfolio = sellAsset(portfolio, sellExecution, 120);
console.log("After SELL:", portfolio);
// 5. Update portfolio value
portfolio = calculatePortfolioValue(portfolio, 120);
console.log("Final Portfolio:", portfolio);
//# sourceMappingURL=test-portfolio.js.map