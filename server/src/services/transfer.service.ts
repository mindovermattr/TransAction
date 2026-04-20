import HttpException from "../exceptions/Http.exception";
import type { CreateTransferDTO } from "../models/transfer/transfer.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";
import { assertAccountAccess } from "./account.service";

const createTransfer = async (
  user: Omit<User, "password">,
  payload: CreateTransferDTO,
) => {
  if (payload.fromAccountId === payload.toAccountId) {
    throw new HttpException(
      400,
      "Счета перевода должны отличаться",
      "INVALID_TRANSFER_ACCOUNTS",
    );
  }

  await Promise.all([
    assertAccountAccess(user.id, payload.fromAccountId, {
      allowArchived: false,
    }),
    assertAccountAccess(user.id, payload.toAccountId, {
      allowArchived: false,
    }),
  ]);

  return prisma.transfer.create({
    data: {
      amount: payload.amount,
      date: payload.date,
      note: payload.note,
      user: {
        connect: {
          id: user.id,
        },
      },
      fromAccount: {
        connect: {
          id: payload.fromAccountId,
        },
      },
      toAccount: {
        connect: {
          id: payload.toAccountId,
        },
      },
    },
    include: {
      fromAccount: {
        select: {
          id: true,
          name: true,
          type: true,
          isArchived: true,
        },
      },
      toAccount: {
        select: {
          id: true,
          name: true,
          type: true,
          isArchived: true,
        },
      },
    },
  });
};

export { createTransfer };
