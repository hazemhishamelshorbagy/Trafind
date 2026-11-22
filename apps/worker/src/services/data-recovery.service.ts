/**
 * What: Recovers candles after the latest candle stored in PostgreSQL.
 * Why: Repairs gaps caused by worker downtime or a dropped live-WebSocket connection.
 */
import { findLatest } from "@trafind/database";
import { collectAndSaveHistoricalData } from "./historical-data.service.js";
import { BinanceInterval, BinanceMarketType } from "../types/market.types.js";


const INTERVAL_DURATION: Record<BinanceInterval, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "1h": 3_600_000
};

interface RecoveryParams {
  symbol: string;
  interval: BinanceInterval;
  marketType?: BinanceMarketType;
}

export async function recoverMissingCandles({
  symbol,
  interval,
  marketType = "SPOT"
}: RecoveryParams) {
  console.log("Starting data recovery...");

  const dbInterval = {
    "1m": "M1",
    "5m": "M5",
    "1h": "H1"
  } as const;

  const latestCandle = await findLatest(
    symbol,
    dbInterval[interval],
    marketType
  );

  if (!latestCandle) {
    console.warn("No historical data found. Recovery skipped.");
    return;
  }

  const startTime =
    latestCandle.openTime.getTime() +
    INTERVAL_DURATION[interval];

  const endTime = Date.now();

  if (startTime > endTime) {
    console.log("No missing candles found.");
    return;
  }

  console.log("Recovering candles:", {
    symbol,
    interval,
    marketType,
    from: new Date(startTime).toISOString(),
    to: new Date(endTime).toISOString()
  });

  const result = await collectAndSaveHistoricalData({
    symbol,
    interval,
    startTime,
    endTime
  });

  console.log("Data recovery completed:", result);
}