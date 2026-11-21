/**
 * What: Calculates mean, variance, standard deviation, and historical volatility.
 * Why: Supplies core statistical helpers for market risk measurements.
 */
import { calculateReturns } from "./returns.js";
export function calculateMean(values) {
    if (values.length === 0) {
        throw new Error("Values cannot be empty");
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
export function calculateDifferences(values, mean) {
    return values.map((value) => value - mean);
}
export function squareDifferences(differences) {
    return differences.map((difference) => difference ** 2);
}
export function calculateVariance(squaredDifferences) {
    if (squaredDifferences.length === 0) {
        throw new Error("Values cannot be empty");
    }
    return calculateMean(squaredDifferences);
}
export function calculateStandardDeviation(variance) {
    if (!Number.isFinite(variance) || variance < 0) {
        throw new Error("Invalid variance");
    }
    return Math.sqrt(variance);
}
export function calculateVolatility(values) {
    if (values.length === 0) {
        throw new Error("Values cannot be empty");
    }
    const mean = calculateMean(values);
    const differences = calculateDifferences(values, mean);
    const squared = squareDifferences(differences);
    const variance = calculateVariance(squared);
    return calculateStandardDeviation(variance);
}
export function calculateHistoricalVolatility(closes) {
    const returns = calculateReturns(closes);
    return calculateVolatility(returns);
}
//# sourceMappingURL=volatility.js.map