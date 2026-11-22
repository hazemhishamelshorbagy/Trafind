export interface BollingerBand {
    upper: number;
    middle: number;
    lower: number;
}
export declare function calculateBollingerBands(closes: number[], period?: number, multiplier?: number): BollingerBand[];
