import { NextFunction, Request, Response } from "express";
import { resolveSemanticErrorCode } from "../exceptions/error-codes";
import { isHttpException } from "../helpers/typeguards/isHttpException";

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isHttpException(error)) {
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    return res.status(status).json({
      code: resolveSemanticErrorCode(error.code, status),
      message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
  }

  res.status(500).json({
    code: resolveSemanticErrorCode("INTERNAL_ERROR", 500),
    message: "Internal Server Error",
  });
};

export { errorHandler };
