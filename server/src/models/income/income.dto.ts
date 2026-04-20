import { Transform } from "class-transformer";
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class IncomeDTO {
  @IsString()
  @MinLength(4)
  name!: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  date!: Date;

  @IsNumber()
  price!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  accountId!: number;
}

export class UpdateIncomeDTO {
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date?: Date;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  accountId?: number;
}
