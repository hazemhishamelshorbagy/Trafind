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