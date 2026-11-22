import { prisma } from "../client.js";
import {
  MarketType,
  PaperMarginMode,
  PaperAccountStatus
} from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";

export interface CreatePaperAccountInput {
  name: string;
  marketType: MarketType;
  initialCapital: number;
}

export function createPaperAccount(input: CreatePaperAccountInput) {
  return prisma.paperAccount.create({
    data: {
      ...input,
      marginMode: input.marketType === MarketType.USD_M_FUTURES
        ? PaperMarginMode.ISOLATED
        : null,
      cash: input.initialCapital,
      equity: input.initialCapital,
      peakEquity: input.initialCapital,
      dailyStartingEquity: input.initialCapital,
      currentDay: new Date().toISOString().slice(0, 10)
    }
  });
}

export function listPaperAccounts() {
  return prisma.paperAccount.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export function findPaperAccount(id: string) {
  return prisma.paperAccount.findUnique({
    where: { id },
    include: {
      trades: {
        orderBy: { createdAt: "desc" },
        take: 100
      }
    }
  });
}

export function findActivePaperAccounts(
  marketType?: MarketType,
  symbol?: string
) {
  return prisma.paperAccount.findMany({
    where: {
      status: PaperAccountStatus.ACTIVE,
      ...(marketType ? { marketType } : {}),
      ...(symbol ? { symbol } : {})
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function setPaperAccountStatus(
  id: string,
  status: PaperAccountStatus
) {
  const result = await prisma.paperAccount.updateMany({
    where: { id },
    data: { status }
  });

  return result.count === 1;
}

export async function commitPaperCandle(
  input: {
    accountId: string;
    expectedLastProcessedOpenTime: Date | null;
    candleOpenTime: Date;
    accountUpdate: Prisma.PaperAccountUpdateManyMutationInput;
    trades: Prisma.PaperTradeCreateManyInput[];
  }
) {
  return prisma.$transaction(async (transaction) => {
    const result = await transaction.paperAccount.updateMany({
      where: {
        id: input.accountId,
        status: PaperAccountStatus.ACTIVE,
        lastProcessedOpenTime: input.expectedLastProcessedOpenTime
      },
      data: {
        ...input.accountUpdate,
        lastProcessedOpenTime: input.candleOpenTime
      }
    });

    if (result.count !== 1) {
      return false;
    }

    if (input.trades.length > 0) {
      await transaction.paperTrade.createMany({
        data: input.trades
      });
    }

    return true;
  });
}
