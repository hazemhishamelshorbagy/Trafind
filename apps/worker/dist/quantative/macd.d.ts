export declare function calculateMACDLine(closes: number[], fastPeriod: number, slowPeriod: number): number[];
export declare function calculateSignalLine(macdValues: number[], signalPeriod: number): number[];
export declare function calculateMACDHistogram(macdValues: number[], signalValues: number[]): number[];
export declare function calculateMACD(closes: number[], fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
};
