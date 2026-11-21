/**
 * What: Manually checks SOLUSDT database completeness for a fixed range.
 * Why: Validates that stored open times match the expected one-minute sequence.
 */
import { findCandleOpenTimes } from "@trafind/database";
import { checkDatabaseCandleQuality } from "../data-quality.service.js";


const result = await checkDatabaseCandleQuality({
  symbol: "SOLUSDT",
  interval: "1m",
  startTime: new Date("2026-11-19T12:00:00Z"),
  endTime: new Date("2026-11-19T12:20:00Z")
});

console.log("Database Quality Result:", result);
