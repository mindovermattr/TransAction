import { NextFunction, Request, Response } from "express";
import { isHttpException } from "../helpers/typeguards/isHttpException";

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isHttpException(error)) {
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    return res.status(status).json({ message });
  }
  res.status(500).json({
    message: "undefined error",
  });
};

export { errorHandler };
