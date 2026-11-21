/**
 * What: Calculates gain/loss averages and Relative Strength Index values.
 * Why: Provides momentum measurements for closing-price series.
 */
export declare function calculatePriceChanges(closes: number[]): number[];
export declare function separateGainsAndLosses(changes: number[]): {
    gains: number[];
    losses: number[];
};
export declare function calculateInitialAverage(values: number[]): number;
export declare function calculateSmoothedAverage(previousAverage: number, currentValue: number, period: number): number;
export declare function calculateRSIValue(averageGain: number, averageLoss: number): number;
export declare function calculateRSI(closes: number[], period: number): number[];
