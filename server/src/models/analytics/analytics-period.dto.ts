import { IsEnum } from "class-validator";

export class AnalyticsPeriodDTO {
  @IsEnum(["month", "quarter", "year"], {
    message: "Параметр period должен быть month, quarter или year",
  })
  period!: "month" | "quarter" | "year";
}
