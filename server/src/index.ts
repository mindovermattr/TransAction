import express from "express";
import passport from "passport";
import authRouter from "./controllers/auth.controller";
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

//routes
app.use("/", authRouter);
app.use("/users", jwtMiddleware, userRouter);

app.use(errorHandler);

app.listen(+process.env.PORT!, () =>
  console.log(`
🚀 Server ready at: http://localhost:${process.env.PORT}
`)
);
