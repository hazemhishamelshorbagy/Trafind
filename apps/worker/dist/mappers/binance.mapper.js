export function mapBinanceKline(kline, symbol, interval) {
    return {
        symbol,
        interval,
        openTime: new Date(kline[0]),
        closeTime: new Date(kline[6]),
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseVolume: kline[9],
        takerBuyQuoteVolume: kline[10]
    };
}
//# sourceMappingURL=binance.mapper.js.map