import assert from "node:assert/strict";
import { backtestRequestSchema } from "../schemas/backtest.schema.js";

const validRange = {
  startTime: "2026-01-01T00:00:00Z",
  endTimeExclusive: "2026-01-09T09:00:00Z"
};

assert.equal(backtestRequestSchema.safeParse(validRange).success, true);
assert.equal(
  backtestRequestSchema.safeParse({
    ...validRange,
    endTimeExclusive: "2026-01-09T08:00:00Z"
  }).success,
  false
);
assert.equal(
  backtestRequestSchema.safeParse({
    ...validRange,
    startTime: "2026-01-01T00:30:00Z"
  }).success,
  false
);
assert.equal(
  backtestRequestSchema.safeParse({
    ...validRange,
    endTimeExclusive: "2026-07-01T00:00:00Z"
  }).success,
  false
);

console.log("Backtest API request validation tests passed.");
