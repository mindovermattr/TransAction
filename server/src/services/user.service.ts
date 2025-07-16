import * as argon2 from "argon2";
import HttpException from "../exceptions/Http.exception";
import { CreateUserDTO } from "../models/user/user.dto";
import { prisma } from "../prisma";

const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

const createUser = async (user: CreateUserDTO) => {
  const isExist = await prisma.user.findFirst({
    where: {
      email: user.email,
    },
  });

  if (isExist) throw new HttpException(400, "Пользователь уже создан");

  const hashPassword = await argon2.hash(user.password);

  const createdUser = await prisma.user.create({
    data: {
      email: user.email,
      name: user.name,
      password: hashPassword,
    },
    omit: {
      password: true,
    },
  });

  return createdUser;
};

const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if(!user)
    throw new HttpException(403, 'Пользователь с таким email не найден')

  
};

export { createUser, getUsers };
