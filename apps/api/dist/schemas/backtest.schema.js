import { z } from "zod";
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_RANGE_MS = 180 * 24 * ONE_HOUR_MS;
const MIN_RANGE_MS = 201 * ONE_HOUR_MS;
const HOUR_ALIGNED_UTC_ISO = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):00:00(?:\.000)?Z$/;
const utcHour = z.string().refine((value) => {
    const time = Date.parse(value);
    const normalized = value.endsWith(".000Z")
        ? value
        : value.replace(/Z$/, ".000Z");
    return (Number.isFinite(time) &&
        HOUR_ALIGNED_UTC_ISO.test(value) &&
        new Date(time).toISOString() === normalized &&
        time % ONE_HOUR_MS === 0);
}, "Must be an hour-aligned UTC ISO timestamp ending in Z");
export const backtestRequestSchema = z.object({
    symbol: z.literal("SOLUSDT").default("SOLUSDT"),
    startTime: utcHour,
    endTimeExclusive: utcHour,
    initialCapital: z.number().finite().positive().max(1_000_000_000).default(1000)
}).superRefine((request, context) => {
    const duration = Date.parse(request.endTimeExclusive) - Date.parse(request.startTime);
    if (duration <= 0) {
        context.addIssue({
            code: "custom",
            path: ["endTimeExclusive"],
            message: "Must be later than startTime"
        });
        return;
    }
    if (duration < MIN_RANGE_MS || duration > MAX_RANGE_MS) {
        context.addIssue({
            code: "custom",
            path: ["endTimeExclusive"],
            message: "Range must be between 201 hours and 180 days"
        });
    }
});
export const backtestHistoryQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20)
});
//# sourceMappingURL=backtest.schema.js.map