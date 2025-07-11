import { AuthLayout } from "./auth.layout";
import { LoginForm } from "./login.form";

export const login = () => {
  return (
    <AuthLayout
      form={<LoginForm />}
      title={"Вход"}
      description={"Логин"}
      footerText={"переход"}
    />
  );
};
