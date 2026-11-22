import { Router } from "express";
import { createBacktest, getBacktest, getBacktestHistory } from "../controllers/backtest.controller.js";
const router = Router();
router.post("/", createBacktest);
router.get("/", getBacktestHistory);
router.get("/:id", getBacktest);
export default router;
//# sourceMappingURL=backtest.routes.js.map