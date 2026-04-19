import { Transform } from "class-transformer";
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
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
}
