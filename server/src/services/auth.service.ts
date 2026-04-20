import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import HttpException from "../exceptions/Http.exception";
import { LoginDTO } from "../models/login/login.dto";
import { CreateUserDTO } from "../models/user/user.dto";
import { prisma } from "../prisma";
import { createUser } from "./user.service";

const tokenExpiresIn = (process.env.JWT_EXPIRES_IN ??
  "7d") as jwt.SignOptions["expiresIn"];

const register = async (userDTO: CreateUserDTO) => {
  const user = await createUser(userDTO);
  const token = jwt.sign(user, process.env.JWT_SECRET as string, {
    expiresIn: tokenExpiresIn,
  });
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

  if (!user) {
    throw new HttpException(
      400,
      "Пользователя не существует",
      "USER_NOT_FOUND",
    );
  }

  const isPasswordMatch = await argon2.verify(user.password, loginDto.password);

  if (!isPasswordMatch) {
    throw new HttpException(400, "Неверный ввод пароля", "INVALID_CREDENTIALS");
  }

  const { password, ...userWithoutPassword } = user;

  const token = jwt.sign(
    userWithoutPassword,
    process.env.JWT_SECRET as string,
    {
      expiresIn: tokenExpiresIn,
    },
  );

  return {
    ...userWithoutPassword,
    token,
  };
};

export { login, register };
