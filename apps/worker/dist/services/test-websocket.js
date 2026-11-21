import { connectBinanceWebSocket } from "../clients/binance-websocket.client.js";
const socket = connectBinanceWebSocket();
// Close connection after 2 minutes
setTimeout(() => {
    console.log("Closing WebSocket test...");
    socket.close();
}, 120_000);
//# sourceMappingURL=test-websocket.js.map