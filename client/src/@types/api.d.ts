interface User {
  id: number;
  email: string;
  name: string;
}

type TransactionTags =
  | "JOY"
  | "TRANSPORT"
  | "FOOD"
  | "EDUCATION"
  | "HOUSING"
  | "OTHER";

interface Transaction {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  tag: TransactionTags;
  price: number;
  date: Date;
  userId: number;
}

interface Income {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  price: number;
  date: Date;
  userId: number;
}

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
