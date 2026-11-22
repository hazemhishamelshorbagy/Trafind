/**
 * What: Handles market-candle HTTP requests and validates query parameters.
 * Why: Separates request validation and response formatting from route registration.
 */
import type { RequestHandler } from "express";
import { findLatestCandles } from "@trafind/database";
import { candlesQuerySchema } from "../schemas/validation-schema.js";

const databaseIntervals = {
  "1m": "M1",
  "5m": "M5",
  "1h": "H1"
} as const;

export const getCandles: RequestHandler = async (req, res, next) => {
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

  const { symbol, marketType, interval, limit } = result.data;
  const databaseMarketType = marketType === "spot"
    ? "SPOT"
    : "USD_M_FUTURES";

  try {
    const candles = await findLatestCandles(
      symbol,
      databaseIntervals[interval],
      limit,
      databaseMarketType
    );

    res.status(200).json({
      success: true,
      data: {
        symbol,
        marketType,
        interval,
        count: candles.length,
        candles: candles.map((candle) => ({
          openTime: candle.openTime.toISOString(),
          closeTime: candle.closeTime.toISOString(),
          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close),
          volume: Number(candle.volume),
          quoteAssetVolume: Number(candle.quoteAssetVolume),
          numberOfTrades: candle.numberOfTrades,
          takerBuyBaseVolume: Number(candle.takerBuyBaseVolume),
          takerBuyQuoteVolume: Number(candle.takerBuyQuoteVolume)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};