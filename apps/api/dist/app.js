/**
 * What: Configures the Express application, middleware, routes, and HTTP port.
 * Why: Keeps API startup wiring separate from the server process entry point.
 */
import express from "express";
import healthRouter from "./routes/health.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import marketRouter from "./routes/market.routes.js";
import backtestRouter from "./routes/backtest.routes.js";
import paperTradingRouter from "./routes/paper-trading.routes.js";
const app = express();
app.use(express.json());
app.use("/api", healthRouter);
app.use("/api/market", marketRouter);
app.use("/api/backtests", backtestRouter);
app.use("/api/paper-trading", paperTradingRouter);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map