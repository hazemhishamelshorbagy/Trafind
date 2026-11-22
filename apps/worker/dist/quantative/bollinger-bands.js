export function calculateBollingerBands(closes, period = 20, multiplier = 2) {
    if (!Number.isInteger(period) ||
        period <= 0 ||
        closes.length < period ||
        !Number.isFinite(multiplier) ||
        multiplier <= 0 ||
        !closes.every((price) => Number.isFinite(price) && price > 0)) {
        throw new Error("Invalid Bollinger Bands input");
    }
    const results = [];
    for (let i = 0; i <= closes.length - period; i++) {
        const window = closes.slice(i, i + period);
        // Calculate Middle Band (SMA)
        const middle = window.reduce((sum, price) => sum + price, 0) / period;
        // Calculate Standard Deviation
        const squaredDifferences = window.map((price) => (price - middle) ** 2);
        const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) /
            period;
        const standardDeviation = Math.sqrt(variance);
        // Calculate Upper and Lower Bands
        const upper = middle + standardDeviation * multiplier;
        const lower = middle - standardDeviation * multiplier;
        results.push({
            upper,
            middle,
            lower
        });
    }
    return results;
}
//# sourceMappingURL=bollinger-bands.js.map