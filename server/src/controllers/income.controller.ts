import express from "express";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { IncomeDTO } from "../models/income/income.dto";
import { User } from "../models/user/user.entity";
import { createIncome, getIncomes } from "../services/income.service";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;

    const transactions = await getIncomes(user);
    res.json(transactions);
  } catch (error: unknown) {
    next(error);
  }
});

router.post(
  "/",
  emptyBodyValidation(),
  dtoValidation(IncomeDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const body = req.validatedBody as IncomeDTO;
      const summary = await createIncome(user, body);
      res.json(summary);
    } catch (error: unknown) {
      next(error);
    }
  }
);

export default router;
