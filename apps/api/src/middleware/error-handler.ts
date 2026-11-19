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