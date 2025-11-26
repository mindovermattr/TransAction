import express from "express";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import { AnalyticsPeriodDTO } from "../models/analytics/analytics-period.dto";
import { User } from "../models/user/user.entity";
import {
  getBalanceOverview,
  getExpensesByCategory,
  getExpensesByWeekday,
  getExpensesTrend,
} from "../services/analytics.service";

const router = express.Router();

router.post(
  "/expenses/by-category",
  emptyBodyValidation(),
  dtoValidation(AnalyticsPeriodDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const { period } = req.validatedBody as AnalyticsPeriodDTO;
      const response = await getExpensesByCategory(user, period);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/expenses/trend",
  emptyBodyValidation(),
  dtoValidation(AnalyticsPeriodDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const { period } = req.validatedBody as AnalyticsPeriodDTO;
      const response = await getExpensesTrend(user, period);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/balance/overview",
  emptyBodyValidation(),
  dtoValidation(AnalyticsPeriodDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const { period } = req.validatedBody as AnalyticsPeriodDTO;
      const response = await getBalanceOverview(user, period);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/expenses/by-weekday",
  emptyBodyValidation(),
  dtoValidation(AnalyticsPeriodDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const { period } = req.validatedBody as AnalyticsPeriodDTO;
      const response = await getExpensesByWeekday(user, period);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
