/**
 * What: Declares and validates market-candle query parameters with Zod.
 * Why: Applies allowed symbols, intervals, limits, defaults, and type coercion centrally.
 */
import { z } from "zod";
export const candlesQuerySchema = z.object({
    symbol: z.enum(["SOLUSDT"]),
    marketType: z.enum(["spot", "usdm"]).default("spot"),
    interval: z
        .enum(["1m", "5m", "1h"])
        .default("1h"),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(1000)
        .default(100)
});
//# sourceMappingURL=validation-schema.js.map