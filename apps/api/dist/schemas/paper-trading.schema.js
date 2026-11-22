import { z } from "zod";
export const createPaperAccountSchema = z.object({
    name: z.string().trim().min(1).max(60),
    marketType: z.enum(["spot", "usdm"]),
    initialCapital: z.number().finite().positive().max(1_000_000_000).default(1000)
});
export const paperAccountStatusSchema = z.object({
    status: z.enum(["active", "paused"])
});
export const paperAccountIdSchema = z.string().uuid();
//# sourceMappingURL=paper-trading.schema.js.map