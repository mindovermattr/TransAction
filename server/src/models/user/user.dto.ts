import { IsEmail, IsString, MinLength } from "class-validator";
import { IsEqual } from "../../decorators/IsEqual";

export class CreateUserDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(6)
  @IsEqual("password")
  confirmPassword!: string;
}
