/**
 * What: Implements database operations for saving and finding candles.
 * Why: Centralizes Prisma queries so worker services do not depend on ORM details.
 */
import { prisma } from "../client.js";
import { CandleInterval } from "../generated/prisma/enums.js";
import { SaveCandleInput } from "../types/data-binance.types.js";

export async function saveMany(candles: SaveCandleInput[]) {
  if (candles.length === 0) {
    return 0;
  }

  const result = await prisma.candle.createMany({
    data: candles,
    skipDuplicates: true
  });

  return result.count;
}

export async function findLatest(
  symbol: string,
  interval: CandleInterval
) {
  return prisma.candle.findFirst({
    where: {
      symbol,
      interval
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
  endTime: Date
) {
  return prisma.candle.findMany({
    where: {
      symbol,
      interval,
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
  limit: number
) {
  const candles = await prisma.candle.findMany({
    where: {
      symbol,
      interval
    },
    orderBy: {
      openTime: "desc"
    },
    take: limit
  });

  return candles.reverse();
}