import { Router } from "express";
import {
  createPaperAccount,
  getPaperAccount,
  getPaperAccounts,
  updatePaperAccountStatus
} from "../controllers/paper-trading.controller.js";

const router = Router();

router.post("/accounts", createPaperAccount);
router.get("/accounts", getPaperAccounts);
router.get("/accounts/:id", getPaperAccount);
router.patch("/accounts/:id", updatePaperAccountStatus);

export default router;
