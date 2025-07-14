import express from "express";
import HttpException from "../exceptions/Http.exception";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { CreateUserDTO } from "../models/user/user.dto";
import { createUser, getUsers } from "../services/user.service";

const router = express.Router();

router.get("/", (req, res) => {
  const users = getUsers();
  res.json(users);
});

router.post(
  "/",
  emptyBodyValidation(),
  dtoValidation(CreateUserDTO),
  async (req, res) => {
    if (!req.validatedBody) return;
    try {
      const user = await createUser(req.validatedBody as CreateUserDTO);
      res.json(user);
    } catch (error: unknown) {
      res.json(error as HttpException);
    }
  }
);
// router.get("/", getUsers);

export default router;
