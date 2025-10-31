import { Transform } from "class-transformer";
import {
  IsDate,
  IsNumber,
  IsString,
  MinDate,
  MinLength,
} from "class-validator";

export class IncomeDTO {
  @IsString()
  @MinLength(4)
  name!: string;

  @IsDate()
  @MinDate(new Date())
  @Transform(() => new Date())
  date!: Date;

  @IsNumber()
  price!: number;
}
