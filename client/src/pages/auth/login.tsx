import { ROUTES } from "@/router/routes";
import { Link } from "react-router";
import { AuthLayout } from "./ui/auth.layout";
import { LoginForm } from "./ui/login.form";

export const Login = () => {
  return (
    <AuthLayout
      form={<LoginForm />}
      title={"Вход в систему"}
      footerText={
        <>
          Еще нет аккаунта? <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
        </>
      }
    />
  );
};
