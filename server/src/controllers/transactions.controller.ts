import { TransactionTag } from "@prisma/client";
import express from "express";
import HttpException from "../exceptions/Http.exception";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import {
  TransactionDTO,
  UpdateTransactionDTO,
} from "../models/transaction/transaction.dto";
import { User } from "../models/user/user.entity";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionsSummary,
  updateTransaction,
} from "../services/transaction.service";

const router = express.Router();

const parseOptionalNumber = (value?: string) => {
  if (value === undefined || value === "") return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseOptionalInt = (value?: string) => {
  if (value === undefined || value === "") return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const {
      search,
      tag,
      accountId,
      minAmount,
      maxAmount,
      dateFrom,
      dateTo,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query as Record<string, string | undefined>;

    const parsedTag =
      tag && Object.values(TransactionTag).includes(tag as TransactionTag)
        ? (tag as TransactionTag)
        : undefined;

    const parsedDateFrom = dateFrom ? new Date(dateFrom) : undefined;
    const parsedDateTo = dateTo ? new Date(dateTo) : undefined;

    const transactions = await getTransactions(user, {
      search: search?.trim() || undefined,
      tag: parsedTag,
      accountId: parseOptionalInt(accountId),
      minAmount: parseOptionalNumber(minAmount),
      maxAmount: parseOptionalNumber(maxAmount),
      dateFrom:
        parsedDateFrom && !Number.isNaN(parsedDateFrom.getTime())
          ? parsedDateFrom
          : undefined,
      dateTo:
        parsedDateTo && !Number.isNaN(parsedDateTo.getTime())
          ? parsedDateTo
          : undefined,
      page: parseOptionalInt(page),
      limit: parseOptionalInt(limit),
      sortBy:
        sortBy === "date" ||
        sortBy === "price" ||
        sortBy === "name" ||
        sortBy === "createdAt"
          ? sortBy
          : undefined,
      sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
    });

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
      const summary = await createTransaction(user, body);
      res.json(summary);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  emptyBodyValidation(),
  dtoValidation(UpdateTransactionDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const id = Number.parseInt(req.params.id, 10);

      if (Number.isNaN(id) || id <= 0) {
        throw new HttpException(400, "Неверный id транзакции", "INVALID_TRANSACTION_ID");
      }

      const transaction = await updateTransaction(
        user,
        id,
        req.validatedBody as UpdateTransactionDTO
      );
      res.json(transaction);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user as User;
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id <= 0) {
      throw new HttpException(400, "Неверный id транзакции", "INVALID_TRANSACTION_ID");
    }

    const response = await deleteTransaction(user, id);
    res.json(response);
  } catch (error: unknown) {
    next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    const user = req.user as User;
    const summary = await getTransactionsSummary(user);
    res.json(summary);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
