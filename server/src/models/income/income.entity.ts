import { Income as IncomePrisma } from "@prisma/client";

export class Income implements IncomePrisma {
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  price!: number;
  date!: Date;
  userId!: number;
}
