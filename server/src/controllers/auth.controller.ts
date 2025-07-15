import express from "express";
import jwt from "jsonwebtoken";
import { isHttpException } from "../helpers/typeguards/isHttpException";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { CreateUserDTO } from "../models/user/user.dto";
import { createUser, getUsers } from "../services/user.service";

const router = express.Router();

router.get("/login", emptyBodyValidation(), (req, res) => {
  const users = getUsers();
  res.json(users);
});

router.post(
  "/register",
  emptyBodyValidation(),
  dtoValidation(CreateUserDTO),
  async (req, res) => {
    try {
      const user = await createUser(req.validatedBody as CreateUserDTO);
      const token = jwt.sign(user, process.env.JWT_SECRET as string);
      res.json({
        ...user,
        token,
      });
    } catch (error: unknown) {
      if (isHttpException(error))
        res.status(error.status).json({
          message: error.message,
        });
    }
  }
);

export default router;
