import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Invalid data provided";
  }

   console.log("error name:", err.name);
  console.log("err.statusCode:", err.statusCode);
  console.log("err.message:", err.message);
  
  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default globalErrorHandler;
