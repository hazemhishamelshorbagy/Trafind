export function mapWebSocketMessageToKline(message) {
    const k = message.k;
    return [
        k.t,
        k.o,
        k.h,
        k.l,
        k.c,
        k.v,
        k.T,
        k.q,
        k.n,
        k.V,
        k.Q,
        "0"
    ];
}
//# sourceMappingURL=binance-websocket.mapper.js.map