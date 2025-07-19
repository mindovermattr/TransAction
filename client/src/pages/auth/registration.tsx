import { ROUTES } from "@/router/routes";
import { Link } from "react-router";
import { AuthLayout } from "./ui/auth.layout";
import { RegistrationForm } from "./ui/registration.form";

export const Registration = () => {
  return (
    <AuthLayout
      form={<RegistrationForm />}
      title={"Регистрация"}
      footerText={
        <>
          Уже есть аккаунт?{" "}
          <Link className="underline-offset-2" to={ROUTES.LOGIN}>
            Вход
          </Link>
        </>
      }
    />
  );
};
