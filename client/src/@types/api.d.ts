interface User {
  id: number;
  email: string;
  name: string;
}

type AccountType = "cash" | "debit" | "savings" | "credit";

type TransactionTags =
  | "JOY"
  | "TRANSPORT"
  | "FOOD"
  | "EDUCATION"
  | "HOUSING"
  | "OTHER";

interface AccountReference {
  id: number;
  name: string;
  type: AccountType;
  isArchived: boolean;
}

interface Account {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  isArchived: boolean;
  userId: number;
}

interface AccountBalanceSnapshot extends Account {
  currentBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  transferInTotal: number;
  transferOutTotal: number;
}

interface Transaction {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  tag: TransactionTags;
  price: number;
  date: Date;
  userId: number;
  accountId: number;
  account: AccountReference;
}

interface Income {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  price: number;
  date: Date;
  userId: number;
  accountId: number;
  account: AccountReference;
}

interface Transfer {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  date: Date;
  note?: string | null;
  userId: number;
  fromAccountId: number;
  toAccountId: number;
  fromAccount: AccountReference;
  toAccount: AccountReference;
}

type AnalyticsPeriod = "month" | "quarter" | "halfYear" | "year";

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
