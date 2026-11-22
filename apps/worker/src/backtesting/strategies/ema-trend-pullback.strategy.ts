import { calculateCandleATR } from "../../quantative/atr.js";
import { calculateEMA } from "../../quantative/moving-averages.js";
import { calculateRSI } from "../../quantative/rsi.js";
import type { Candle, Strategy, TradingSignal } from "../backtest.types.js";

const FAST_EMA_PERIOD = 50;
const SLOW_EMA_PERIOD = 200;
const RSI_PERIOD = 14;
const ATR_PERIOD = 14;
const ATR_STOP_MULTIPLIER = 2;
const RSI_ENTRY_LEVEL = 40;
const RSI_EXIT_LEVEL = 70;

export const emaTrendPullbackStrategy: Strategy = {
  name: "EMA Trend Pullback",

  analyze(candles: Candle[]): TradingSignal {
    if (candles.length < SLOW_EMA_PERIOD) {
      return {
        action: "HOLD",
        reason: `Need at least ${SLOW_EMA_PERIOD} candles`
      };
    }

    const closes = candles.map((candle) => candle.close);
    const fastEMA = calculateEMA(closes, FAST_EMA_PERIOD).at(-1)!;
    const slowEMA = calculateEMA(closes, SLOW_EMA_PERIOD).at(-1)!;
    const rsiValues = calculateRSI(closes, RSI_PERIOD);
    const currentRSI = rsiValues.at(-1)!;
    const previousRSI = rsiValues.at(-2)!;

    if (fastEMA < slowEMA || currentRSI >= RSI_EXIT_LEVEL) {
      return {
        action: "SELL",
        reason: fastEMA < slowEMA
          ? "EMA 50 fell below EMA 200"
          : "RSI reached the overbought exit level"
      };
    }

    if (previousRSI <= RSI_ENTRY_LEVEL && currentRSI > RSI_ENTRY_LEVEL) {
      const currentATR = calculateCandleATR(candles, ATR_PERIOD).at(-1)!;
      const stopLoss =
        candles[candles.length - 1].close -
        ATR_STOP_MULTIPLIER * currentATR;

      if (stopLoss > 0) {
        return {
          action: "BUY",
          reason: "Bullish EMA trend with RSI recovery above 40",
          stopLoss
        };
      }
    }

    return {
      action: "HOLD",
      reason: "No entry or exit condition met"
    };
  }
};
