import { NextFunction, Request, Response } from "express";
import passport from "passport";

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
          return res.status(401).json({
            error:
              info.name === "TokenExpiredError"
                ? "Token expired"
                : "Invalid token",
          });
        }

        if (err || !user) {
          return res.status(401).json({
            error: info?.message || "Unauthorized",
          });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};

export { jwtAuthMiddleware };
