/**
 * What: Registers market-data routes under the market API prefix.
 * Why: Keeps route paths separate from request-controller logic.
 */
import { Router } from "express";
import { getCandles } from "../controllers/market.controller.js";
const router = Router();
router.get("/candles", getCandles);
export default router;
//# sourceMappingURL=market.routes.js.map