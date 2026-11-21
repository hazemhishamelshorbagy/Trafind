/**
 * What: Manually tests detection of missing candles after the latest stored time.
 * Why: Checks that trailing gaps include only closed one-minute boundaries.
 */
import { detectTrailingMissingCandles } from "../data-quality.service.js";
const result = detectTrailingMissingCandles(new Date("2026-11-19T10:02:00Z"), 60_000, new Date("2026-11-19T12:07:30Z"));
console.log(result.map(date => date.toISOString()));
//# sourceMappingURL=test-trailing-gaps.js.map