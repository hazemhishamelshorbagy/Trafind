import { retry } from "../utils/retry.js";

const REQUEST_TIMEOUT = 10_000;

interface BinanceFundingRate {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
}

class BinanceFundingApiError extends Error {
  constructor(
    public readonly status: number,
    statusText: string
  ) {
    super(`Binance funding API error: ${status} ${statusText}`);
    this.name = "BinanceFundingApiError";
  }
}

export async function getBinanceFundingRateAt(
  symbol: string,
  fundingTime: number
) {
  const params = new URLSearchParams({
    symbol,
    startTime: String(fundingTime),
    endTime: String(fundingTime),
    limit: "1"
  });
  const url = `https://fapi.binance.com/fapi/v1/fundingRate?${params}`;
  const response = await retry(
    async () => {
      const result = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      });

      if (!result.ok) {
        throw new BinanceFundingApiError(result.status, result.statusText);
      }

      return result;
    },
    {
      retries: 2,
      delay: 1000,
      shouldRetry: (error) =>
        !(error instanceof BinanceFundingApiError) ||
        error.status === 429 ||
        error.status >= 500
    }
  );
  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid Binance funding response");
  }

  const funding = data.find((item): item is BinanceFundingRate =>
    typeof item === "object" &&
    item !== null &&
    "fundingTime" in item &&
    Number(item.fundingTime) === fundingTime &&
    "fundingRate" in item &&
    typeof item.fundingRate === "string"
  );

  if (!funding) {
    throw new Error(`Binance funding rate not found at ${fundingTime}`);
  }

  const rate = Number(funding.fundingRate);
  if (!Number.isFinite(rate)) {
    throw new Error(`Invalid Binance funding rate at ${fundingTime}`);
  }

  return rate;
}
