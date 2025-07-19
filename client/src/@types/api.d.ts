interface User {
  id: number;
  email: string;
  name: string;
}

type LoginResponse = User & {
  token: string;
};
