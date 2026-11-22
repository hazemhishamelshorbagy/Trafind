type CandleInterval = "M1" | "M5" | "H1";
interface BollingerBandsInput {
    symbol: string;
    interval: CandleInterval;
    period?: number;
    multiplier?: number;
}
export declare function getBollingerBands({ symbol, interval, period, multiplier }: BollingerBandsInput): Promise<{
    upper: number;
    middle: number;
    lower: number;
    openTime: Date;
}[]>;
export {};
