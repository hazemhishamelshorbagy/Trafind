import type { ClosedTrade, ExitReason } from "./performance.types.js";
export interface OpenTrade {
    entryPrice: number;
    quantity: number;
    entryFee: number;
    entryTime: Date;
}
export declare function createTradeRecorder(): {
    hasOpenTrade: () => boolean;
    open: (trade: OpenTrade) => void;
    close: (exitPrice: number, exitFee: number, exitTime: Date, exitReason: ExitReason) => ClosedTrade;
    getClosedTrades: () => ClosedTrade[];
};
