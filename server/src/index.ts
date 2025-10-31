import cors from "cors";
import express from "express";
import passport from "passport";
import authRouter from "./controllers/auth.controller";
import incomeRouter from "./controllers/income.controller";
import transactionRouter from "./controllers/transactions.controller";
import userRouter from "./controllers/user.contoller";
import { jwtAuthMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { jwtStrategy } from "./strategies/jwt.strategy";

const app = express();
const jwtMiddleware = jwtAuthMiddleware();

passport.use(jwtStrategy);

//middlewares
app.use(passport.initialize());
app.use(express.json());
app.use(cors());

//routes
app.use("/auth", authRouter);
app.use("/users", jwtMiddleware, userRouter);
app.use("/transactions", jwtMiddleware, transactionRouter);
app.use("/income", jwtMiddleware, incomeRouter);

//error handler middleware
app.use(errorHandler);

app.listen(+process.env.PORT!, () =>
  console.log(`
🚀 Server ready at: http://localhost:${process.env.PORT}
`)
);
