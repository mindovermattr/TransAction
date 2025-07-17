import express from "express";
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
  async (req, res, next) => {
    try {
      const user = await createUser(req.validatedBody as CreateUserDTO);
      res.json(user);
    } catch (error: unknown) {
      next(error);
    }
  }
);
// router.get("/", getUsers);

export default router;
