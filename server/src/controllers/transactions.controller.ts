import express from "express";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { TransactionDTO } from "../models/transaction/transaction.dto";
import { User } from "../models/user/user.entity";
import {
  createTransaction,
  getTransactions,
} from "../services/transaction.service";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const transactions = await getTransactions(user);
    res.json(transactions);
  } catch (error: unknown) {
    next(error);
  }
});

router.post(
  "/",
  emptyBodyValidation(),
  dtoValidation(TransactionDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const body = req.validatedBody as TransactionDTO;
      const transaction = await createTransaction(user, body);
      res.json(transaction);
    } catch (error: unknown) {
      next(error);
    }
  }
);

export default router;
