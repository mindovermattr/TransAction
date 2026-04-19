import express from "express";
import HttpException from "../exceptions/Http.exception";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { IncomeDTO, UpdateIncomeDTO } from "../models/income/income.dto";
import { User } from "../models/user/user.entity";
import {
  createIncome,
  deleteIncome,
  getIncomes,
  getIncomeSummary,
  updateIncome,
} from "../services/income.service";

const router = express.Router();

const parseOptionalInt = (value?: string) => {
  if (value === undefined || value === "") return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const { page, limit, dateFrom, dateTo, sortBy, sortOrder, search } =
      req.query as Record<string, string | undefined>;

    const parsedDateFrom = dateFrom ? new Date(dateFrom) : undefined;
    const parsedDateTo = dateTo ? new Date(dateTo) : undefined;

    const transactions = await getIncomes(user, {
      page: parseOptionalInt(page),
      limit: parseOptionalInt(limit),
      search: search?.trim() || undefined,
      dateFrom:
        parsedDateFrom && !Number.isNaN(parsedDateFrom.getTime())
          ? parsedDateFrom
          : undefined,
      dateTo:
        parsedDateTo && !Number.isNaN(parsedDateTo.getTime())
          ? parsedDateTo
          : undefined,
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

router.get("/summary", async (req, res, next) => {
  try {
    const user = req.user as User;
    const summary = await getIncomeSummary(user);
    res.json(summary);
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

router.patch(
  "/:id",
  emptyBodyValidation(),
  dtoValidation(UpdateIncomeDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const id = Number.parseInt(req.params.id, 10);

      if (Number.isNaN(id) || id <= 0) {
        throw new HttpException(400, "Неверный id дохода", "INVALID_INCOME_ID");
      }

      const income = await updateIncome(user, id, req.validatedBody as UpdateIncomeDTO);
      res.json(income);
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
      throw new HttpException(400, "Неверный id дохода", "INVALID_INCOME_ID");
    }

    const response = await deleteIncome(user, id);
    res.json(response);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
