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
