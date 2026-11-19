import WebSocket from "ws";
import { processLiveCandle } from "../services/live-candle.service.js";
import { recoverMissingCandles } from "../services/data-recovery.service.js";
import { BinanceWebSocketMessage } from "../types/market.types.js";

const BINANCE_WS_URL =
  "wss://stream.binance.com:9443/ws/solusdt@kline_1m";
let connectionId = 0;

let recoveryPromise: Promise<void> | null = null;
const INITIAL_RECONNECT_DELAY = 1_000;
const MAX_RECONNECT_DELAY = 30_000;
const HEARTBEAT_INTERVAL = 30_000;

export function connectBinanceWebSocket() {
  let socket: WebSocket | null = null;

  let reconnectTimer: NodeJS.Timeout | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  let reconnectDelay = INITIAL_RECONNECT_DELAY;
  let shouldReconnect = true;

  let recoveryInProgress = false;

  const messageBuffer: BinanceWebSocketMessage[] = [];

  async function processBufferedMessages() {
    while (messageBuffer.length > 0) {
      const message = messageBuffer.shift();

      if (!message) continue;

      await processLiveCandle(message);
    }
  }

 async function startRecovery(currentConnectionId: number) {
  recoveryInProgress = true;

  try {
    // Wait for any previous recovery to finish.
    if (recoveryPromise) {
      await recoveryPromise;
    }

    // Ignore outdated connections.
    if (
      !shouldReconnect ||
      currentConnectionId !== connectionId
    ) {
      return;
    }

    console.log("Starting data recovery...");

    const currentRecovery = recoverMissingCandles({
      symbol: "SOLUSDT",
      interval: "1m"
    });

    recoveryPromise = currentRecovery;

    try {
      await currentRecovery;
    } finally {
      if (recoveryPromise === currentRecovery) {
        recoveryPromise = null;
      }
    }

    // Check again after recovery.
    if (
      !shouldReconnect ||
      currentConnectionId !== connectionId
    ) {
      return;
    }

    console.log("Recovery completed. Processing buffered messages...");

    await processBufferedMessages();

    if (currentConnectionId === connectionId) {
      recoveryInProgress = false;
      console.log("Live candle processing resumed.");
    }

  } catch (error) {
    console.error("Data recovery failed:", error);

    if (currentConnectionId === connectionId) {
      socket?.terminate();
    }
  }
}

  function connect() {
    if (!shouldReconnect) return;

    console.log("Connecting to Binance...");

    socket = new WebSocket(BINANCE_WS_URL);

    let isAlive = true;

    socket.on("open", () => {
      console.log("Connected to Binance!");

      reconnectDelay = INITIAL_RECONNECT_DELAY;

      void startRecovery(++connectionId);

      heartbeatTimer = setInterval(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          return;
        }

        if (!isAlive) {
          console.warn("Heartbeat failed. Terminating connection.");
          socket.terminate();
          return;
        }

        isAlive = false;
        socket.ping();

      }, HEARTBEAT_INTERVAL);
    });

    socket.on("pong", () => {
      isAlive = true;
    });

    socket.on("message", (data) => {
      try {
        const message = JSON.parse(
          data.toString()
        ) as BinanceWebSocketMessage;

        if (message.e !== "kline") return;

        if (recoveryInProgress) {
          if (message.k.x) {
            messageBuffer.push(message);
          }

          return;
        }

        void processLiveCandle(message).catch((error) => {
          console.error("Failed to process live candle:", error);
        });

      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error.message);
    });

    socket.on("close", (code, reason) => {
      console.log("WebSocket disconnected:", {
        code,
        reason: reason.toString()
      });

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }

      if (!shouldReconnect) return;

      console.log(`Reconnecting in ${reconnectDelay / 1000} seconds...`);

      reconnectTimer = setTimeout(() => {
        connect();
      }, reconnectDelay);

      reconnectDelay = Math.min(
        reconnectDelay * 2,
        MAX_RECONNECT_DELAY
      );
    });
  }

  connect();

  return {
    close() {
      shouldReconnect = false;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }

      socket?.close();

      console.log("WebSocket shutdown requested.");
    }
  };
}