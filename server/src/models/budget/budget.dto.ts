import { TransactionTag } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator";

const BUDGET_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export class CreateBudgetDTO {
  @IsString()
  @Matches(BUDGET_MONTH_REGEX)
  month!: string;

  @IsEnum(TransactionTag)
  tag!: TransactionTag;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit!: number;
}

export class UpdateBudgetDTO {
  @IsOptional()
  @IsString()
  @Matches(BUDGET_MONTH_REGEX)
  month?: string;

  @IsOptional()
  @IsEnum(TransactionTag)
  tag?: TransactionTag;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit?: number;
}
