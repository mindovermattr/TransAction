import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsString, MinLength } from "class-validator";

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
