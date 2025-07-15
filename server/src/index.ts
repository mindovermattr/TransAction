import express from "express";
import passport from "passport";
import authRouter from "./controllers/auth.controller";
import userRouter from "./controllers/user.contoller";
import { jwtAuthMiddleware } from "./middleware/auth.middleware";
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

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`)
);
