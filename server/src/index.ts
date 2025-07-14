import express from "express";
import passport from "passport";
import userRouter from "./controllers/user.contoller";
import { jwtAuthMiddleware } from "./middleware/auth.middleware";
import { jwtStrategy } from "./strategies/jwt.strategy";

const app = express();

passport.use(jwtStrategy);

//middlewares
app.use(passport.initialize());
app.use(express.json());

//routes
app.use("/users", userRouter);
app.use("/userss", jwtAuthMiddleware(), userRouter);

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`)
);
