import jwt from "jsonwebtoken";
import { CreateUserDTO } from "../models/user/user.dto";
import { createUser } from "./user.service";

const register = async (userDTO: CreateUserDTO) => {
  const user = await createUser(userDTO);
  const token = jwt.sign(user, process.env.JWT_SECRET as string);
  return {
    ...user,
    token,
  };
};

export { register };
