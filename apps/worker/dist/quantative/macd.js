import { calculateEMA } from "./moving-averages.js";
import { calculateEMAFromValues } from "./moving-averages.js";
export function calculateMACDLine(closes, fastPeriod, slowPeriod) {
    if (!Number.isInteger(fastPeriod) ||
        !Number.isInteger(slowPeriod) ||
        fastPeriod <= 0 ||
        slowPeriod <= 0 ||
        fastPeriod >= slowPeriod ||
        closes.length < slowPeriod) {
        throw new Error("Invalid MACD input");
    }
    const fastEMA = calculateEMA(closes, fastPeriod);
    const slowEMA = calculateEMA(closes, slowPeriod);
    const offset = slowPeriod - fastPeriod;
    return slowEMA.map((slowValue, index) => {
        const fastValue = fastEMA[index + offset];
        return fastValue - slowValue;
    });
}
export function calculateSignalLine(macdValues, signalPeriod) {
    return calculateEMAFromValues(macdValues, signalPeriod);
}
export function calculateMACDHistogram(macdValues, signalValues) {
    if (macdValues.length !== signalValues.length ||
        macdValues.length === 0) {
        throw new Error("Invalid MACD and Signal values");
    }
    return macdValues.map((macd, index) => macd - signalValues[index]);
}
export function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const macdLine = calculateMACDLine(closes, fastPeriod, slowPeriod);
    if (!Number.isInteger(signalPeriod) ||
        signalPeriod <= 0 ||
        macdLine.length < signalPeriod) {
        throw new Error("Invalid MACD signal period");
    }
    const signalLine = calculateSignalLine(macdLine, signalPeriod);
    const offset = signalPeriod - 1;
    const histogram = signalLine.map((signal, index) => {
        return macdLine[index + offset] - signal;
    });
    return {
        macdLine,
        signalLine,
        histogram
    };
}
//# sourceMappingURL=macd.js.map