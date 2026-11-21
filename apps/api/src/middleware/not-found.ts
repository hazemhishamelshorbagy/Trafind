/**
 * What: Handles requests that do not match a registered API route.
 * Why: Returns a predictable 404 JSON response instead of Express's default HTML.
 */
import type { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
};