/**
 * What: Exposes the database client's public API.
 * Why: Gives applications one import surface for Prisma and candle repository operations.
 */
export {
  saveMany,
  findLatest,
  findCandleOpenTimes
} from "./repositories/candle.repository.js";
export { prisma } from "./client.js";