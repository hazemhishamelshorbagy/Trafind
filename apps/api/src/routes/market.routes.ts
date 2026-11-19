import { Router } from "express";
import { getCandles } from "../controllers/market.controller.js";

const router = Router();

router.get("/candles", getCandles);

export default router;