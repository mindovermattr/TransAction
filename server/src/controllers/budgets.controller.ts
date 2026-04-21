import express from "express";
import HttpException from "../exceptions/Http.exception";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { CreateBudgetDTO, UpdateBudgetDTO } from "../models/budget/budget.dto";
import { User } from "../models/user/user.entity";
import {
  archiveBudget,
  createBudget,
  getBudgets,
  updateBudget,
} from "../services/budget.service";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const month =
      typeof req.query.month === "string" ? req.query.month.trim() : undefined;
    const includeArchived = req.query.includeArchived === "true";

    const budgets = await getBudgets(user, {
      month: month || undefined,
      includeArchived,
    });

    res.json(budgets);
  } catch (error: unknown) {
    next(error);
  }
});

router.post(
  "/",
  emptyBodyValidation(),
  dtoValidation(CreateBudgetDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const body = req.validatedBody as CreateBudgetDTO;
      const budget = await createBudget(user, body);
      res.json(budget);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.patch(
  "/:id",
  emptyBodyValidation(),
  dtoValidation(UpdateBudgetDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const id = Number.parseInt(req.params.id, 10);

      if (Number.isNaN(id) || id <= 0) {
        throw new HttpException(400, "Неверный id бюджета", "INVALID_BUDGET_ID");
      }

      const budget = await updateBudget(
        user,
        id,
        req.validatedBody as UpdateBudgetDTO,
      );
      res.json(budget);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user as User;
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id <= 0) {
      throw new HttpException(400, "Неверный id бюджета", "INVALID_BUDGET_ID");
    }

    const budget = await archiveBudget(user, id);
    res.json(budget);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
