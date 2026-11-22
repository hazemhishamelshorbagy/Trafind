import {
  commitPaperCandle,
  findActivePaperAccounts,
  findCandlesByTimeRange,
  findLatestCandles
} from "@trafind/database";

import { getBinanceFundingRateAt } from "../clients/binance-funding.client.js";
import type { Candle } from "../backtesting/backtest.types.js";
import type { BinanceMarketType } from "../types/market.types.js";

import {
  type PaperAccountState,
  processPaperCandle
} from "./paper-trading.engine.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const STRATEGY_WARMUP_CANDLES = 201;

type PaperAccountRecord =
  Awaited<ReturnType<typeof findActivePaperAccounts>>[number];

type CandleRecord =
  Awaited<ReturnType<typeof findCandlesByTimeRange>>[number];

function toState(account: PaperAccountRecord): PaperAccountState {
  return {
    id: account.id,
    marketType: account.marketType,
    initialCapital: Number(account.initialCapital),
    cash: Number(account.cash),
    assetQuantity: Number(account.assetQuantity),

    averageEntryPrice:
      account.averageEntryPrice === null
        ? null
        : Number(account.averageEntryPrice),

    stopLossPrice:
      account.stopLossPrice === null
        ? null
        : Number(account.stopLossPrice),

    isolatedMargin: Number(account.isolatedMargin),
    realizedPnl: Number(account.realizedPnl),
    equity: Number(account.equity),

    lastMarkPrice:
      account.lastMarkPrice === null
        ? null
        : Number(account.lastMarkPrice),

    peakEquity: Number(account.peakEquity),
    dailyStartingEquity: Number(account.dailyStartingEquity),
    currentDay: account.currentDay,

    pendingAction: account.pendingAction,
    pendingReason: account.pendingReason,

    pendingStopLoss:
      account.pendingStopLoss === null
        ? null
        : Number(account.pendingStopLoss),

    pendingSignalOpenTime: account.pendingSignalOpenTime,
    lastProcessedOpenTime: account.lastProcessedOpenTime,

    leverage: account.leverage,
    feeRate: Number(account.feeRate),
    slippageRate: Number(account.slippageRate)
  };
}

function toCandle(candle: CandleRecord): Candle {
  return {
    openTime: candle.openTime,
    closeTime: candle.closeTime,
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume)
  };
}

function isAtFundingTime(time: Date): boolean {
  return (
    time.getUTCMinutes() === 0 &&
    time.getUTCSeconds() === 0 &&
    time.getUTCMilliseconds() === 0 &&
    time.getUTCHours() % 8 === 0
  );
}

function validateContinuousCandles(
  candles: Candle[],
  accountId: string
): void {
  for (let index = 1; index < candles.length; index++) {
    const previousTime = candles[index - 1].openTime.getTime();
    const currentTime = candles[index].openTime.getTime();

    if (currentTime - previousTime !== ONE_HOUR_MS) {
      throw new Error(
        `Paper account ${accountId} has a missing H1 candle`
      );
    }
  }
}

async function processAccount(account: PaperAccountRecord): Promise<void> {
  // 1. Get the latest available H1 candle.
  const latestRows = await findLatestCandles(
    account.symbol,
    account.interval,
    1,
    account.marketType
  );

  const latest = latestRows[0];

  if (!latest) {
    return;
  }

  // 2. Determine the first candle that needs processing.
  const processingStartTime = account.lastProcessedOpenTime
    ? account.lastProcessedOpenTime.getTime() + ONE_HOUR_MS
    : latest.openTime.getTime();

  // 3. Load enough historical candles before that point for indicators.
  const warmupStartTime =
    processingStartTime - STRATEGY_WARMUP_CANDLES * ONE_HOUR_MS;

  const rangeStartTime = new Date(warmupStartTime);

  const rangeEndTime = new Date(
    latest.openTime.getTime() + ONE_HOUR_MS
  );

  // 4. Load the complete historical range.
  const rows = await findCandlesByTimeRange(
    account.symbol,
    account.interval,
    rangeStartTime,
    rangeEndTime,
    account.marketType
  );

  const candles = rows.map(toCandle);

  if (candles.length < STRATEGY_WARMUP_CANDLES) {
    return;
  }

  // 5. Validate candle continuity.
  validateContinuousCandles(candles, account.id);

  // 6. Convert the database account into engine state.
  const state = toState(account);

  let firstUnprocessedIndex: number;

  if (state.lastProcessedOpenTime === null) {
    // New account: start with the latest candle.
    firstUnprocessedIndex = candles.length - 1;
  } else {
    // Existing account: find the next unprocessed candle.
    firstUnprocessedIndex = candles.findIndex(
      (candle) =>
        candle.openTime.getTime() >
        state.lastProcessedOpenTime!.getTime()
    );

    if (firstUnprocessedIndex < 0) {
      return;
    }

    const firstUnprocessed = candles[firstUnprocessedIndex];

    if (
      firstUnprocessed.openTime.getTime() -
        state.lastProcessedOpenTime.getTime() !== ONE_HOUR_MS
    ) {
      throw new Error(
        `Paper account ${account.id} has an unrepaired H1 gap`
      );
    }
  }

  // 7. Process all pending candles in chronological order.
  for (
    let candleIndex = firstUnprocessedIndex;
    candleIndex < candles.length;
    candleIndex++
  ) {
    const candle = candles[candleIndex];

    // Verify there are no gaps between processed candles.
    if (
      state.lastProcessedOpenTime !== null &&
      candle.openTime.getTime() -
        state.lastProcessedOpenTime.getTime() !== ONE_HOUR_MS
    ) {
      throw new Error(
        `Paper account ${account.id} has an unrepaired H1 gap`
      );
    }

    // 8. Fetch funding rate when required.
    let fundingRate: number | undefined;

    if (
      state.marketType === "USD_M_FUTURES" &&
      state.assetQuantity > 0 &&
      isAtFundingTime(candle.openTime)
    ) {
      fundingRate = await getBinanceFundingRateAt(
        account.symbol,
        candle.openTime.getTime()
      );
    }

    // 9. Process the candle using all historical data available so far.
    const history = candles.slice(0, candleIndex + 1);

    const result = processPaperCandle(
      state,
      history,
      candle,
      fundingRate
    );

    // 10. Save account state and trades atomically.
    const committed = await commitPaperCandle({
      accountId: account.id,
      expectedLastProcessedOpenTime: state.lastProcessedOpenTime,
      candleOpenTime: candle.openTime,
      accountUpdate: result.account,
      trades: result.trades
    });

    // Another worker may have processed this candle,
    // or the account may have been paused.
    if (!committed) {
      return;
    }

    // 11. Update in-memory state after successful database commit.
    Object.assign(state, result.account, {
      lastProcessedOpenTime: candle.openTime
    });
  }
}

export async function processActivePaperAccounts(
  symbol: string,
  marketType: BinanceMarketType
): Promise<void> {
  const accounts = await findActivePaperAccounts(
    marketType,
    symbol
  );

  // Process accounts independently.
  // An error in one account must not stop the others.
  for (const account of accounts) {
    try {
      await processAccount(account);
    } catch (error) {
      console.error(
        `[Paper Trading] Failed to process account ${account.id}:`,
        error
      );
    }
  }
}