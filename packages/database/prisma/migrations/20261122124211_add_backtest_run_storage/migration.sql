-- CreateTable
CREATE TABLE "backtest_runs" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "interval" "CandleInterval" NOT NULL,
    "strategyName" VARCHAR(100) NOT NULL,
    "startTime" TIMESTAMPTZ(3) NOT NULL,
    "endTimeExclusive" TIMESTAMPTZ(3) NOT NULL,
    "initialCapital" DECIMAL(30,12) NOT NULL,
    "finalEquity" DECIMAL(30,12) NOT NULL,
    "totalCandles" INTEGER NOT NULL,
    "tradeCount" INTEGER NOT NULL,
    "configuration" JSONB NOT NULL,
    "performance" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backtest_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backtest_runs_symbol_interval_createdAt_idx" ON "backtest_runs"("symbol", "interval", "createdAt" DESC);
