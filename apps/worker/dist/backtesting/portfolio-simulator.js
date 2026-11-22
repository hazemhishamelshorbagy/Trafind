function validatePortfolio(portfolio) {
    if (!Number.isFinite(portfolio.cash) ||
        portfolio.cash < 0 ||
        !Number.isFinite(portfolio.assetQuantity) ||
        portfolio.assetQuantity < 0 ||
        !Number.isFinite(portfolio.averageEntryPrice) ||
        portfolio.averageEntryPrice < 0 ||
        !Number.isFinite(portfolio.realizedPnL) ||
        !Number.isFinite(portfolio.unrealizedPnL) ||
        !Number.isFinite(portfolio.equity)) {
        throw new Error("Invalid portfolio state");
    }
    if (portfolio.assetQuantity === 0 &&
        portfolio.averageEntryPrice !== 0) {
        throw new Error("Invalid average entry price");
    }
    if (portfolio.assetQuantity > 0 &&
        portfolio.averageEntryPrice <= 0) {
        throw new Error("Invalid average entry price");
    }
}
export function createPortfolio(initialCapital) {
    if (!Number.isFinite(initialCapital) || initialCapital <= 0) {
        throw new Error("Invalid initial capital");
    }
    return {
        cash: initialCapital,
        assetQuantity: 0,
        equity: initialCapital,
        unrealizedPnL: 0,
        averageEntryPrice: 0,
        realizedPnL: 0
    };
}
export function calculatePortfolioValue(portfolio, currentPrice) {
    validatePortfolio(portfolio);
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
        throw new Error("Invalid current price");
    }
    const assetValue = portfolio.assetQuantity * currentPrice;
    const equity = portfolio.cash + assetValue;
    const unrealizedPnL = assetValue -
        portfolio.assetQuantity * portfolio.averageEntryPrice;
    return {
        ...portfolio,
        equity,
        unrealizedPnL
    };
}
export function buyAsset(portfolio, execution, currentPrice) {
    validatePortfolio(portfolio);
    if (!Number.isFinite(execution.quantity) ||
        execution.quantity <= 0 ||
        !Number.isFinite(execution.executionPrice) ||
        execution.executionPrice <= 0 ||
        !Number.isFinite(execution.netCashFlow) ||
        execution.netCashFlow >= 0) {
        throw new Error("Invalid purchase values");
    }
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
        throw new Error("Invalid current price");
    }
    const totalCost = Math.abs(execution.netCashFlow);
    if (totalCost > portfolio.cash) {
        throw new Error("Insufficient balance");
    }
    const totalAssetCost = portfolio.averageEntryPrice * portfolio.assetQuantity +
        totalCost;
    const newQuantity = portfolio.assetQuantity + execution.quantity;
    const averageEntryPrice = totalAssetCost / newQuantity;
    const updatedPortfolio = {
        ...portfolio,
        cash: portfolio.cash - totalCost,
        assetQuantity: newQuantity,
        averageEntryPrice
    };
    return calculatePortfolioValue(updatedPortfolio, currentPrice);
}
export function sellAsset(portfolio, execution, currentPrice) {
    validatePortfolio(portfolio);
    if (!Number.isFinite(execution.quantity) ||
        execution.quantity <= 0 ||
        !Number.isFinite(execution.executionPrice) ||
        execution.executionPrice <= 0 ||
        !Number.isFinite(execution.netCashFlow) ||
        execution.netCashFlow <= 0) {
        throw new Error("Invalid sale values");
    }
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
        throw new Error("Invalid current price");
    }
    if (execution.quantity > portfolio.assetQuantity) {
        throw new Error("Insufficient asset quantity");
    }
    const netRevenue = execution.netCashFlow;
    const remainingQuantity = portfolio.assetQuantity - execution.quantity;
    const soldAssetCost = portfolio.averageEntryPrice * execution.quantity;
    const realizedProfit = netRevenue - soldAssetCost;
    const realizedPnL = portfolio.realizedPnL + realizedProfit;
    const remainingAverageEntryPrice = remainingQuantity === 0
        ? 0
        : portfolio.averageEntryPrice;
    const updatedPortfolio = {
        ...portfolio,
        cash: portfolio.cash + netRevenue,
        assetQuantity: remainingQuantity,
        averageEntryPrice: remainingAverageEntryPrice,
        realizedPnL
    };
    return calculatePortfolioValue(updatedPortfolio, currentPrice);
}
//# sourceMappingURL=portfolio-simulator.js.map