import express from "express";
import type { User } from "../models/user/user.entity";

const router = express.Router();

router.get("/me", (req, res) => {
  res.json(req.user as Omit<User, "password">);
});

export default router;
