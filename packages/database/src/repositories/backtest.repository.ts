import { prisma } from "../client.js";
import { CandleInterval } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";

export interface SaveBacktestRunInput {
  symbol: string;
  interval: CandleInterval;
  strategyName: string;
  startTime: Date;
  endTimeExclusive: Date;
  initialCapital: number;
  finalEquity: number;
  totalCandles: number;
  tradeCount: number;
  configuration: Prisma.InputJsonValue;
  performance: Prisma.InputJsonValue;
  result: Prisma.InputJsonValue;
}

export function saveBacktestRun(input: SaveBacktestRunInput) {
  return prisma.backtestRun.create({
    data: input
  });
}

export function findBacktestRun(id: string) {
  return prisma.backtestRun.findUnique({
    where: { id }
  });
}

export function findLatestBacktestRuns(limit: number) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Invalid backtest history limit");
  }

  return prisma.backtestRun.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      symbol: true,
      interval: true,
      strategyName: true,
      startTime: true,
      endTimeExclusive: true,
      initialCapital: true,
      finalEquity: true,
      totalCandles: true,
      tradeCount: true,
      performance: true,
      createdAt: true
    }
  });
}
