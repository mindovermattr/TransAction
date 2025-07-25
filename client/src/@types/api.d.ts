interface User {
  id: number;
  email: string;
  name: string;
}

interface Transaction {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  tag: string;
  price: number;
  date: Date;
  userId: number;
}
