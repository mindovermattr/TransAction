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

export class CreateTransferDTO {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  fromAccountId!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  toAccountId!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  date!: Date;

  @IsOptional()
  @IsString()
  @MinLength(2)
  note?: string;
}
