/**
 * What: Requests historical kline pages from Binance's public REST data API.
 * Why: Keeps HTTP request construction and response validation out of collection services.
 */
import { retry } from "../utils/retry.js";
const REQUEST_TIMEOUT = 10_000;
export function buildBinanceKlinesUrl({ symbol, interval, marketType = "SPOT", limit = 1000, startTime, endTime }) {
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
    const endpoint = marketType === "SPOT"
        ? "https://data-api.binance.vision/api/v3/klines"
        : "https://fapi.binance.com/fapi/v1/klines";
    return `${endpoint}?${params}`;
}
class BinanceApiError extends Error {
    status;
    constructor(status, statusText) {
        super(`Binance API error: ${status} ${statusText}`);
        this.status = status;
        this.name = "BinanceApiError";
    }
}
export async function getKlines({ symbol, interval, marketType = "SPOT", limit = 1000, startTime, endTime }) {
    const url = buildBinanceKlinesUrl({
        symbol,
        interval,
        marketType,
        limit,
        startTime,
        endTime
    });
    const response = await retry(async () => {
        const result = await fetch(url, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT)
        });
        if (!result.ok) {
            throw new BinanceApiError(result.status, result.statusText);
        }
        return result;
    }, {
        retries: 2,
        delay: 1000,
        shouldRetry: (error) => {
            if (error instanceof BinanceApiError) {
                return error.status === 429 || error.status >= 500;
            }
            return true;
        }
    });
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid Binance response");
    }
    return data;
}
//# sourceMappingURL=binance.client.js.map