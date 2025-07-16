import express from "express";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { LoginDTO } from "../models/login/login.dto";
import { CreateUserDTO } from "../models/user/user.dto";
import { register } from "../services/auth.service";

const router = express.Router();

router.get(
  "/login",
  emptyBodyValidation(),
  dtoValidation(LoginDTO),
  (req, res) => {
    const body = req.validatedBody as LoginDTO;
  }
);

router.post(
  "/register",
  emptyBodyValidation(),
  dtoValidation(CreateUserDTO),
  async (req, res, next) => {
    try {
      const user = await register(req.validatedBody as CreateUserDTO);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
