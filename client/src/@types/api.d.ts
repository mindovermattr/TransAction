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

interface DashboardOverviewResponse {
  period: "month";
  totals: {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
  };
  comparisons: {
    previousIncome: number;
    previousExpenses: number;
    incomeDeltaPercent: number;
    expensesDeltaPercent: number;
  };
  insights: {
    topCategory: {
      tag: TransactionTags;
      total: number;
      sharePercent: number;
    } | null;
    peakSpendDay: {
      date: string;
      total: number;
    } | null;
  };
  cashflow: {
    months: {
      monthStart: string;
      income: number;
      expenses: number;
      balance: number;
    }[];
  };
  topCategories: {
    tag: TransactionTags;
    total: number;
    sharePercent: number;
  }[];
  weekdayTotals: {
    weekday: number;
    label: string;
    total: number;
  }[];
  recentActivity: {
    id: string;
    type: "income" | "expense";
    name: string;
    amount: number;
    date: string;
    tag?: TransactionTags;
  }[];
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
