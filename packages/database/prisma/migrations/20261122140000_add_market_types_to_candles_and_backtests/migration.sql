CREATE TYPE "MarketType" AS ENUM ('SPOT', 'USD_M_FUTURES');

ALTER TABLE "candles"
ADD COLUMN "marketType" "MarketType" NOT NULL DEFAULT 'SPOT';

DROP INDEX "candles_symbol_interval_openTime_key";
DROP INDEX "candles_symbol_interval_openTime_idx";

CREATE UNIQUE INDEX "candles_symbol_marketType_interval_openTime_key"
ON "candles"("symbol", "marketType", "interval", "openTime");

CREATE INDEX "candles_symbol_marketType_interval_openTime_idx"
ON "candles"("symbol", "marketType", "interval", "openTime" DESC);

ALTER TABLE "backtest_runs"
ADD COLUMN "marketType" "MarketType" NOT NULL DEFAULT 'SPOT';

DROP INDEX "backtest_runs_symbol_interval_createdAt_idx";

CREATE INDEX "backtest_runs_symbol_marketType_interval_createdAt_idx"
ON "backtest_runs"("symbol", "marketType", "interval", "createdAt" DESC);
