import express from "express";
import type { User } from "../models/user/user.entity";
import { getDashboardOverview } from "../services/dashboard.service";

const router = express.Router();

router.get("/overview", async (req, res, next) => {
  try {
    const user = req.user as User;
    const response = await getDashboardOverview(user);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
