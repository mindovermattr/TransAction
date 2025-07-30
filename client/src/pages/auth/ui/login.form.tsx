import { login } from "@/api/requests";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setUserLS } from "@/lib/localstorage";
import { isOfetchError } from "@/lib/typeguards";
import { ROUTES } from "@/router/routes";
import { loginSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

export const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await login({ params: data });
      setUserLS(response);
      navigate(ROUTES.TRANSACTIONS);
    } catch (error) {
      if (!isOfetchError(error)) return;
      const errorData = error.data as { message: string };
      form.setError("root", errorData);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@gmail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button>Отправить</Button>
        {form.formState.errors.root && (
          <p
            data-slot="form-message"
            className="text-destructive text-center text-sm"
          >
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </Form>
  );
};
