import type { LucideIcon } from "lucide-react";
import {
  CarFrontIcon,
  DramaIcon,
  EllipsisIcon,
  GraduationCapIcon,
  HouseIcon,
  UtensilsIcon,
} from "lucide-react";

export const TRANSACTION_TYPES_ICONS: Record<TransactionTags, LucideIcon> = {
  JOY: DramaIcon,
  TRANSPORT: CarFrontIcon,
  FOOD: UtensilsIcon,
  EDUCATION: GraduationCapIcon,
  HOUSING: HouseIcon,
  OTHER: EllipsisIcon,
} as const;
