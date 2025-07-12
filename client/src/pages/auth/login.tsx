import { ROUTES } from "@/router/router";
import { Link } from "react-router";
import { AuthLayout } from "./ui/auth.layout";
import { LoginForm } from "./ui/login.form";

export const Login = () => {
  return (
    <AuthLayout
      form={<LoginForm />}
      title={"Login"}
      footerText={
        <>
          Еще нет аккаунта? <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
        </>
      }
    />
  );
};
