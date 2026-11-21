/**
 * What: Converts unexpected server errors into a consistent HTTP 500 response.
 * Why: Prevents raw errors from reaching API consumers and centralizes error logging.
 */
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error"
    }
  });
};