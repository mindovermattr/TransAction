import { $Enums } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

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

export class UpdateTransactionDTO {
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date?: Date;

  @IsOptional()
  @IsEnum($Enums.TransactionTag)
  tag?: $Enums.TransactionTag;

  @IsOptional()
  @IsNumber()
  price?: number;
}
