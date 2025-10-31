import { NextFunction, Request, Response } from "express";
import passport from "passport";
import HttpException from "../exceptions/Http.exception";

const jwtAuthMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (
        err: any,
        user: Express.User | false,
        info: { message?: string; name?: string }
      ) => {
        if (info && info.name) {
          return next(
            new HttpException(
              401,
              info.name === "TokenExpiredError"
                ? "Token expired"
                : "Invalid token"
            )
          );
        }

        if (err || !user) {
          return next(new HttpException(401, info?.message || "Unauthorized"));
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};

export { jwtAuthMiddleware };
