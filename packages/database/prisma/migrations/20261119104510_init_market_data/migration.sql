-- CreateEnum
CREATE TYPE "CandleInterval" AS ENUM ('M1', 'M5', 'H1');

-- CreateTable
CREATE TABLE "candles" (
    "id" BIGSERIAL NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "interval" "CandleInterval" NOT NULL,
    "openTime" TIMESTAMPTZ(3) NOT NULL,
    "closeTime" TIMESTAMPTZ(3) NOT NULL,
    "open" DECIMAL(30,12) NOT NULL,
    "high" DECIMAL(30,12) NOT NULL,
    "low" DECIMAL(30,12) NOT NULL,
    "close" DECIMAL(30,12) NOT NULL,
    "volume" DECIMAL(30,12) NOT NULL,
    "quoteAssetVolume" DECIMAL(30,12) NOT NULL,
    "numberOfTrades" INTEGER NOT NULL,
    "takerBuyBaseVolume" DECIMAL(30,12) NOT NULL,
    "takerBuyQuoteVolume" DECIMAL(30,12) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "candles_symbol_interval_openTime_idx" ON "candles"("symbol", "interval", "openTime" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "candles_symbol_interval_openTime_key" ON "candles"("symbol", "interval", "openTime");
