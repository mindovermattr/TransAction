import z from "zod";

const loginSchema = z.object({
  email: z.email("Неверный email"),
  password: z
    .string("Пароль обязателен")
    .min(6, "Пароль должен быть не менее 6 символов"),
});

const registrationSchema = loginSchema
  .extend({
    name: z.string("Имя обязательно"),
    confirmPassword: z.string("Подтверждение пароля обязательно"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают",
  });

export { loginSchema, registrationSchema };
