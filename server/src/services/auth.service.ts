import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import HttpException from "../exceptions/Http.exception";
import { LoginDTO } from "../models/login/login.dto";
import { CreateUserDTO } from "../models/user/user.dto";
import { prisma } from "../prisma";
import { createUser } from "./user.service";

const register = async (userDTO: CreateUserDTO) => {
  const user = await createUser(userDTO);
  const token = jwt.sign(user, process.env.JWT_SECRET as string);
  return {
    ...user,
    token,
  };
};

const login = async (loginDto: LoginDTO) => {
  const user = await prisma.user.findFirst({
    where: {
      email: loginDto.email,
    },
  });
 
  if (!user) throw new HttpException(400, "Пользователя не существует");

  const isPasswordMatch = await argon2.verify(user.password, loginDto.password);

  if (!isPasswordMatch) throw new HttpException(400, "Неверный ввод пароля");

  const { password, ...userWithoutPassword } = user;

  const token = jwt.sign(userWithoutPassword, process.env.JWT_SECRET as string);

  return {
    ...userWithoutPassword,
    token,
  };
};

export { login, register };
