import { retry } from "../utils/retry.js";
const REQUEST_TIMEOUT = 10_000;
class BinanceFundingApiError extends Error {
    status;
    constructor(status, statusText) {
        super(`Binance funding API error: ${status} ${statusText}`);
        this.status = status;
        this.name = "BinanceFundingApiError";
    }
}
export async function getBinanceFundingRateAt(symbol, fundingTime) {
    const params = new URLSearchParams({
        symbol,
        startTime: String(fundingTime),
        endTime: String(fundingTime),
        limit: "1"
    });
    const url = `https://fapi.binance.com/fapi/v1/fundingRate?${params}`;
    const response = await retry(async () => {
        const result = await fetch(url, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT)
        });
        if (!result.ok) {
            throw new BinanceFundingApiError(result.status, result.statusText);
        }
        return result;
    }, {
        retries: 2,
        delay: 1000,
        shouldRetry: (error) => !(error instanceof BinanceFundingApiError) ||
            error.status === 429 ||
            error.status >= 500
    });
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid Binance funding response");
    }
    const funding = data.find((item) => typeof item === "object" &&
        item !== null &&
        "fundingTime" in item &&
        Number(item.fundingTime) === fundingTime &&
        "fundingRate" in item &&
        typeof item.fundingRate === "string");
    if (!funding) {
        throw new Error(`Binance funding rate not found at ${fundingTime}`);
    }
    const rate = Number(funding.fundingRate);
    if (!Number.isFinite(rate)) {
        throw new Error(`Invalid Binance funding rate at ${fundingTime}`);
    }
    return rate;
}
//# sourceMappingURL=binance-funding.client.js.map