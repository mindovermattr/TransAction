import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import passport from "passport";
import accountsRouter from "./controllers/accounts.controller";
import analyticsRouter from "./controllers/analytics.controller";
import authRouter from "./controllers/auth.controller";
import incomeRouter from "./controllers/income.controller";
import transfersRouter from "./controllers/transfers.controller";
import transactionRouter from "./controllers/transactions.controller";
import userRouter from "./controllers/user.contoller";
import { jwtAuthMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { jwtStrategy } from "./strategies/jwt.strategy";

const app = express();
const jwtMiddleware = jwtAuthMiddleware();

passport.use(jwtStrategy);

const port = Number(process.env.PORT ?? 3000);

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(passport.initialize());
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/auth", authRateLimiter, authRouter);
app.use("/users", jwtMiddleware, userRouter);
app.use("/accounts", jwtMiddleware, accountsRouter);
app.use("/transfers", jwtMiddleware, transfersRouter);
app.use("/transactions", jwtMiddleware, transactionRouter);
app.use("/income", jwtMiddleware, incomeRouter);
app.use("/analytics", jwtMiddleware, analyticsRouter);

app.use(errorHandler);

app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
