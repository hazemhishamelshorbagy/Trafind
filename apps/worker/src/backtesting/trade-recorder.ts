import type {
  ClosedTrade,
  ExitReason
} from "./performance.types.js";

export interface OpenTrade {
  entryPrice: number;
  quantity: number;
  entryFee: number;
  entryTime: Date;
}





export function createTradeRecorder() {
  let openTrade: OpenTrade | null = null;

  const closedTrades: ClosedTrade[] = [];

  function hasOpenTrade(): boolean {
    return openTrade !== null;
  }

  function open(trade: OpenTrade): void {
    if (openTrade) {
      throw new Error("A trade is already open");
    }

    if (
      !Number.isFinite(trade.entryPrice) ||
      trade.entryPrice <= 0 ||
      !Number.isFinite(trade.quantity) ||
      trade.quantity <= 0 ||
      !Number.isFinite(trade.entryFee) ||
      trade.entryFee < 0 ||
      !(trade.entryTime instanceof Date) ||
      !Number.isFinite(trade.entryTime.getTime())
    ) {
      throw new Error("Invalid trade");
    }

    openTrade = trade;
  }

  function close(
    exitPrice: number,
    exitFee: number,
    exitTime: Date,
    exitReason: ExitReason
  ): ClosedTrade {
    if (!openTrade) {
      throw new Error("No open trade to close");
    }

    if (
      !Number.isFinite(exitPrice) ||
      exitPrice <= 0 ||
      !Number.isFinite(exitFee) ||
      exitFee < 0 ||
      !(exitTime instanceof Date) ||
      !Number.isFinite(exitTime.getTime())
    ) {
      throw new Error("Invalid exit trade data");
    }

    if (
      ![
        "STOP_LOSS",
        "STRATEGY_EXIT",
        "END_OF_BACKTEST"
      ].includes(exitReason)
    ) {
      throw new Error("Invalid exit reason");
    }

    const pnl =
      (exitPrice - openTrade.entryPrice) * openTrade.quantity -
      openTrade.entryFee -
      exitFee;

    const closedTrade: ClosedTrade = {
      entryPrice: openTrade.entryPrice,
      exitPrice,
      quantity: openTrade.quantity,
      pnl,
      entryTime: openTrade.entryTime,
      exitTime,
      exitReason: "STRATEGY_EXIT"
    };

    closedTrades.push(closedTrade);

    openTrade = null;

    return closedTrade;
  }

  function getClosedTrades(): ClosedTrade[] {
    return [...closedTrades];
  }

  return {
    hasOpenTrade,
    open,
    close,
    getClosedTrades
  };
}