/**
 * What: Calculates gain/loss averages and Relative Strength Index values.
 * Why: Provides momentum measurements for closing-price series.
 */
export function calculatePriceChanges(closes) {
    if (closes.length < 2 ||
        !closes.every((price) => Number.isFinite(price) && price > 0)) {
        throw new Error("Invalid closing prices");
    }
    const changes = [];
    for (let i = 1; i < closes.length; i++) {
        changes.push(closes[i] - closes[i - 1]);
    }
    return changes;
}
export function separateGainsAndLosses(changes) {
    const gains = [];
    const losses = [];
    for (const change of changes) {
        gains.push(Math.max(change, 0));
        losses.push(Math.max(-change, 0));
    }
    return { gains, losses };
}
export function calculateInitialAverage(values) {
    if (values.length === 0 ||
        !values.every((value) => Number.isFinite(value) && value >= 0)) {
        throw new Error("Invalid values");
    }
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
}
export function calculateSmoothedAverage(previousAverage, currentValue, period) {
    if (!Number.isFinite(previousAverage) ||
        !Number.isFinite(currentValue) ||
        previousAverage < 0 ||
        currentValue < 0 ||
        !Number.isInteger(period) ||
        period <= 0) {
        throw new Error("Invalid smoothing values");
    }
    return ((previousAverage * (period - 1) + currentValue) /
        period);
}
export function calculateRSIValue(averageGain, averageLoss) {
    if (!Number.isFinite(averageGain) ||
        !Number.isFinite(averageLoss) ||
        averageGain < 0 ||
        averageLoss < 0) {
        throw new Error("Invalid average values");
    }
    if (averageGain === 0 && averageLoss === 0) {
        return 50;
    }
    if (averageLoss === 0) {
        return 100;
    }
    if (averageGain === 0) {
        return 0;
    }
    const relativeStrength = averageGain / averageLoss;
    return 100 - 100 / (1 + relativeStrength);
}
export function calculateRSI(closes, period) {
    if (!Number.isInteger(period) ||
        period <= 0 ||
        closes.length < period + 1) {
        throw new Error("Invalid RSI input");
    }
    const changes = calculatePriceChanges(closes);
    const { gains, losses } = separateGainsAndLosses(changes);
    let averageGain = calculateInitialAverage(gains.slice(0, period));
    let averageLoss = calculateInitialAverage(losses.slice(0, period));
    const results = [
        calculateRSIValue(averageGain, averageLoss)
    ];
    for (let i = period; i < changes.length; i++) {
        averageGain = calculateSmoothedAverage(averageGain, gains[i], period);
        averageLoss = calculateSmoothedAverage(averageLoss, losses[i], period);
        results.push(calculateRSIValue(averageGain, averageLoss));
    }
    return results;
}
//# sourceMappingURL=rsi.js.map