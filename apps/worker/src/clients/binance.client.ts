import type { GetKlinesParams, BinanceKline } from "../types/market.types.js";

const BINANCE_BASE_URL = "https://data-api.binance.vision";
export async function getKlines({
  symbol,
  interval,
  limit = 1000,
  startTime,
  endTime
}: GetKlinesParams): Promise<BinanceKline[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    limit: String(limit)
  });

  if (startTime !== undefined) {
    params.set("startTime", String(startTime));
  }

  if (endTime !== undefined) {
    params.set("endTime", String(endTime));
  }

  const response = await fetch(
    `${BINANCE_BASE_URL}/api/v3/klines?${params}`
  );

  if (!response.ok) {
    throw new Error(
      `Binance API error: ${response.status} ${response.statusText}`
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid Binance response");
  }

  return data as BinanceKline[];
}