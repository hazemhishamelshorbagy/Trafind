/**
 * What: Manually tests sample candle ordering, dates, and missing-gap detection.
 * Why: Provides focused runtime assertions for data-quality calculations.
 */
import assert from "node:assert/strict";
import { areCandleDatesValid, checkCandleData, detectMissingCandles } from "../data-quality.service.js";
const openTimes = [
    "2026-11-20T10:00:00Z",
    "2026-11-20T10:01:00Z",
    "2026-11-20T10:04:00Z",
    "2026-11-20T10:05:00Z"
].map((time) => new Date(time));
const missing = detectMissingCandles(openTimes, 60_000);
const actual = missing.map((date) => date.toISOString());
const expected = [
    "2026-11-20T10:02:00.000Z",
    "2026-11-20T10:03:00.000Z"
];
assert.deepEqual(actual, expected);
console.log("Data Quality test passed:", actual);
assert.equal(areCandleDatesValid([
    new Date("2026-11-20T10:00:00Z"),
    new Date("2026-11-20T10:01:00Z")
]), true);
assert.equal(areCandleDatesValid([
    new Date("invalid")
]), false);
console.log("Date validation tests passed");
const missingCandles = checkCandleData(openTimes, 60_000);
assert.equal(missingCandles.length, 2);
console.log("Full Data Quality check passed");
//# sourceMappingURL=test-data-quality.js.map