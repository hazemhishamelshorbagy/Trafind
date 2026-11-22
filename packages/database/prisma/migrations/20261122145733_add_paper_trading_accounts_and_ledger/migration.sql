CREATE TYPE "PaperAccountStatus" AS ENUM ('ACTIVE', 'PAUSED');
CREATE TYPE "PaperSignalAction" AS ENUM ('BUY', 'SELL');
CREATE TYPE "PaperTradeAction" AS ENUM ('BUY', 'SELL', 'FUNDING');

CREATE TABLE "paper_accounts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL DEFAULT 'SOLUSDT',
    "marketType" "MarketType" NOT NULL,
    "interval" "CandleInterval" NOT NULL DEFAULT 'H1',
    "strategyName" VARCHAR(100) NOT NULL DEFAULT 'EMA Trend Pullback',
    "status" "PaperAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "initialCapital" DECIMAL(30,12) NOT NULL,
    "cash" DECIMAL(30,12) NOT NULL,
    "assetQuantity" DECIMAL(30,12) NOT NULL DEFAULT 0,
    "averageEntryPrice" DECIMAL(30,12),
    "stopLossPrice" DECIMAL(30,12),
    "isolatedMargin" DECIMAL(30,12) NOT NULL DEFAULT 0,
    "realizedPnl" DECIMAL(30,12) NOT NULL DEFAULT 0,
    "equity" DECIMAL(30,12) NOT NULL,
    "lastMarkPrice" DECIMAL(30,12),
    "peakEquity" DECIMAL(30,12) NOT NULL,
    "dailyStartingEquity" DECIMAL(30,12) NOT NULL,
    "currentDay" VARCHAR(10) NOT NULL,
    "pendingAction" "PaperSignalAction",
    "pendingReason" VARCHAR(200),
    "pendingStopLoss" DECIMAL(30,12),
    "pendingSignalOpenTime" TIMESTAMPTZ(3),
    "lastProcessedOpenTime" TIMESTAMPTZ(3),
    "leverage" INTEGER NOT NULL DEFAULT 1,
    "feeRate" DECIMAL(10,8) NOT NULL DEFAULT 0.001,
    "slippageRate" DECIMAL(10,8) NOT NULL DEFAULT 0.0005,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "paper_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "paper_trades" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "candleOpenTime" TIMESTAMPTZ(3) NOT NULL,
    "action" "PaperTradeAction" NOT NULL,
    "executionPrice" DECIMAL(30,12) NOT NULL,
    "quantity" DECIMAL(30,12) NOT NULL,
    "fee" DECIMAL(30,12) NOT NULL,
    "fundingAmount" DECIMAL(30,12) NOT NULL DEFAULT 0,
    "realizedPnl" DECIMAL(30,12) NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paper_trades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "paper_trades_accountId_fkey" FOREIGN KEY ("accountId")
        REFERENCES "paper_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "paper_accounts_name_key" ON "paper_accounts"("name");
CREATE INDEX "paper_accounts_status_marketType_symbol_idx"
ON "paper_accounts"("status", "marketType", "symbol");
CREATE UNIQUE INDEX "paper_trades_accountId_candleOpenTime_action_key"
ON "paper_trades"("accountId", "candleOpenTime", "action");
CREATE INDEX "paper_trades_accountId_createdAt_idx"
ON "paper_trades"("accountId", "createdAt" DESC);
