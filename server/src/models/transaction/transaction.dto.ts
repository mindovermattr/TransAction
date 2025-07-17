import { $Enums } from "@prisma/client";
import { Transform } from "class-transformer";
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
  @Transform(() => new Date())
  date!: Date;

  @IsEnum($Enums.TransactionTag)
  tag!: $Enums.TransactionTag;

  @IsNumber()
  price!: number;
}
