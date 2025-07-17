import { $Enums } from "@prisma/client";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  MinDate,
  MinLength,
} from "class-validator";

export class TransactionDTO {
  @IsString()
  @MinLength(4)
  name!: string;

  @IsDate()
  @MinDate(new Date())
  date!: Date;

  @IsNumber()
  userId!: number;

  @IsEnum($Enums.TransactionTag)
  tag!: $Enums.TransactionTag;

  @IsNumber()
  price!:number
}
