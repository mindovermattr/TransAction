import express from "express";
import { User } from "../models/user/user.entity";
import { getTransactions } from "../services/transaction.service";

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

export default router;
