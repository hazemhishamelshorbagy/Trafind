export function simulateExecution(action, expectedPrice, slippageRate, quantity, feeRate) {
    if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate >= 1) {
        throw new Error("Invalid fee rate");
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Invalid quantity");
    }
    if (!Number.isFinite(expectedPrice) ||
        expectedPrice <= 0 ||
        !Number.isFinite(slippageRate) ||
        slippageRate < 0 ||
        slippageRate >= 1) {
        throw new Error("Invalid execution values");
    }
    const executionPrice = action === "BUY"
        ? expectedPrice * (1 + slippageRate)
        : expectedPrice * (1 - slippageRate);
    const slippage = Math.abs(executionPrice - expectedPrice);
    const totalValue = executionPrice * quantity;
    const fee = totalValue * feeRate;
    const totalCost = totalValue + fee;
    const netCashFlow = action === "BUY"
        ? -(totalValue + fee)
        : totalValue - fee;
    return {
        expectedPrice,
        executionPrice,
        slippage,
        quantity,
        totalValue,
        fee,
        totalCost,
        netCashFlow
    };
}
//# sourceMappingURL=execution-simulator.js.map