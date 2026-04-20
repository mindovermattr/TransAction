import { IsEnum } from "class-validator";

export class AnalyticsPeriodDTO {
  @IsEnum(["month", "quarter", "halfYear", "year"], {
    message: "Параметр period должен быть month, quarter, halfYear или year",
  })
  period!: "month" | "quarter" | "halfYear" | "year";
}
