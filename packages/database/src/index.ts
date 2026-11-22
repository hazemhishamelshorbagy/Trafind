/**
 * What: Exposes the database client's public API.
 * Why: Gives applications one import surface for Prisma and candle repository operations.
 */
export {
  saveMany,
  findLatest,
  findCandleOpenTimes,
  findLatestCandles,
  findCandlesByTimeRange
} from "./repositories/candle.repository.js";
export {
  saveBacktestRun,
  findBacktestRun,
  findLatestBacktestRuns
} from "./repositories/backtest.repository.js";
export {
  createPaperAccount,
  listPaperAccounts,
  findPaperAccount,
  findActivePaperAccounts,
  setPaperAccountStatus,
  commitPaperCandle
} from "./repositories/paper-trading.repository.js";
export { PaperAccountStatus } from "./generated/prisma/enums.js";
export { prisma } from "./client.js";