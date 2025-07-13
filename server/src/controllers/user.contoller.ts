import express from "express";
import validationMiddleware from "../middleware/validation.middleware";
import { CreateUserDTO } from "../models/user/user.dto";
import { getUsers } from "../services/user.service";

const router = express.Router();

router.get("/", validationMiddleware(CreateUserDTO), getUsers);
// router.get("/", getUsers);

export default router;
