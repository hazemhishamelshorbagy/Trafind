/**
 * What: Implements database operations for saving and finding candles.
 * Why: Centralizes Prisma queries so worker services do not depend on ORM details.
 */
import { prisma } from "../client.js";
import { CandleInterval, MarketType } from "../generated/prisma/enums.js";
import { SaveCandleInput } from "../types/data-binance.types.js";

export async function saveMany(candles: SaveCandleInput[]) {
  if (candles.length === 0) {
    return 0;
  }

  const result = await prisma.candle.createMany({
    data: candles.map((candle) => ({
      ...candle,
      marketType: candle.marketType ?? MarketType.SPOT
    })),
    skipDuplicates: true
  });

  return result.count;
}

export async function findLatest(
  symbol: string,
  interval: CandleInterval,
  marketType: MarketType = MarketType.SPOT
) {
  return prisma.candle.findFirst({
    where: {
      symbol,
      interval,
      marketType
    },
    orderBy: {
      openTime: "desc"
    }
  });
}

export async function findCandleOpenTimes(
  symbol: string,
  interval: CandleInterval,
  startTime: Date,
  endTime: Date,
  marketType: MarketType = MarketType.SPOT
) {
  return prisma.candle.findMany({
    where: {
      symbol,
      interval,
      marketType,
      openTime: {
        gte: startTime,
        lte: endTime
      }
    },
    select: {
      openTime: true
    },
    orderBy: {
      openTime: "asc"
    }
  });
}

export async function findLatestCandles(
  symbol: string,
  interval: CandleInterval,
  limit: number,
  marketType: MarketType = MarketType.SPOT
) {
  const candles = await prisma.candle.findMany({
    where: {
      symbol,
      interval,
      marketType
    },
    orderBy: {
      openTime: "desc"
    },
    take: limit
  });

  return candles.reverse();
}

export async function findCandlesByTimeRange(
  symbol: string,
  interval: CandleInterval,
  startTime: Date,
  endTimeExclusive: Date,
  marketType: MarketType = MarketType.SPOT
) {
  if (
    !Number.isFinite(startTime.getTime()) ||
    !Number.isFinite(endTimeExclusive.getTime()) ||
    startTime >= endTimeExclusive
  ) {
    throw new Error("Invalid candle time range");
  }

  return prisma.candle.findMany({
    where: {
      symbol,
      interval,
      marketType,
      openTime: {
        gte: startTime,
        lt: endTimeExclusive
      }
    },
    orderBy: {
      openTime: "asc"
    }
  });
}