import { $Enums } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsString, MinLength } from "class-validator";

export class TransactionDTO {
  @IsString()
  @MinLength(4)
  name!: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  date!: Date;

  @IsEnum($Enums.TransactionTag)
  tag!: $Enums.TransactionTag;

  @IsNumber()
  price!: number;
}
