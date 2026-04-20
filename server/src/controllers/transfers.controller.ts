import express from "express";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { CreateTransferDTO } from "../models/transfer/transfer.dto";
import { User } from "../models/user/user.entity";
import { createTransfer } from "../services/transfer.service";

const router = express.Router();

router.post(
  "/",
  emptyBodyValidation(),
  dtoValidation(CreateTransferDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const body = req.validatedBody as CreateTransferDTO;
      const transfer = await createTransfer(user, body);
      res.json(transfer);
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
