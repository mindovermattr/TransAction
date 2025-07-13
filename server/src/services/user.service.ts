import type { Request, Response } from "express";
import { prisma } from "../prisma";

const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json({users});
};

export { getUsers };
