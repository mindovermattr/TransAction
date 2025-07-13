import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import express from "express";
import userRouter from "./controllers/user.contoller";

const prisma = new PrismaClient().$extends(withAccelerate());

const app = express();

app.use(express.json());

app.use("/user", userRouter);

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`)
);
