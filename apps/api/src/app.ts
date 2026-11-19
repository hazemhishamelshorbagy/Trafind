import express from "express";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import marketRouter from "./routes/market.routes.js";
const app = express();

const PORT = env.PORT;

// Middleware
app.use(express.json());

// Health Check
app.use("/api", healthRouter);
app.use("/api/market", marketRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Trafind API running on port ${PORT}`);
});
// 404 Not Found Middleware
app.use(notFoundHandler);
// global  error middle ware
app.use(errorHandler);
export default app;