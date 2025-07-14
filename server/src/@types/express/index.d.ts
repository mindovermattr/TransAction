import "express";

declare global {
  namespace Express {
    export interface Request {
      validatedBody?: Record<string, any>;
    }
  }
}
