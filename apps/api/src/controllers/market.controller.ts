import type { RequestHandler } from "express";
import { candlesQuerySchema } from "../schemas/validation-schema.js";


export const getCandles: RequestHandler = (req, res) => {
  const result = candlesQuerySchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid query parameters",
        details: result.error.issues
      }
    });

    return;
  }

  const { symbol, interval, limit } = result.data;

  res.status(200).json({
    success: true,
    data: {
      symbol,
      interval,
      limit
    }
  });
};