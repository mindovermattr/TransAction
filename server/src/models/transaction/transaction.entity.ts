import { $Enums, Transaction as TransactionPrisma } from "@prisma/client";

export class Transaction implements TransactionPrisma {
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  tag!: $Enums.TransactionTag;
  price!: number;
  date!: Date;
  userId!: number;
}
