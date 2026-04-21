import express from "express";
import HttpException from "../exceptions/Http.exception";
import {
  dtoValidation,
  emptyBodyValidation,
} from "../middleware/validation.middleware";
import {
  CreateAccountDTO,
  UpdateAccountDTO,
} from "../models/account/account.dto";
import { User } from "../models/user/user.entity";
import {
  archiveAccount,
  createAccount,
  getAccounts,
  updateAccount,
} from "../services/account.service";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const includeArchived = req.query.includeArchived === "true";
    const accounts = await getAccounts(user, {
      includeArchived,
    });
    res.json(accounts);
  } catch (error: unknown) {
    next(error);
  }
});

router.post(
  "/",
  emptyBodyValidation(),
  dtoValidation(CreateAccountDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const body = req.validatedBody as CreateAccountDTO;
      const account = await createAccount(user, body);
      res.json(account);
    } catch (error: unknown) {
      console.log(error);
      next(error);
    }
  },
);

router.patch(
  "/:id",
  emptyBodyValidation(),
  dtoValidation(UpdateAccountDTO),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const id = Number.parseInt(req.params.id, 10);

      if (Number.isNaN(id) || id <= 0) {
        throw new HttpException(400, "Неверный id счета", "INVALID_ACCOUNT_ID");
      }

      const account = await updateAccount(
        user,
        id,
        req.validatedBody as UpdateAccountDTO,
      );
      res.json(account);
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
      throw new HttpException(400, "Неверный id счета", "INVALID_ACCOUNT_ID");
    }

    const account = await archiveAccount(user, id);
    res.json(account);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
