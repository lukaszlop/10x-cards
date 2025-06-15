import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginFormSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nieprawidłowy email lub hasło");
      }

      toast.success("Zalogowano pomyślnie! Za chwilę zostaniesz przekierowany.");
      setTimeout(() => {
        window.location.href = "/"; // Redirect to a protected page
      }, 2000); // 2-second delay
    } catch (error) {
      console.error("Caught error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-test-id="login-form">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Adres email
        </label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="twoj@email.com"
          autoComplete="email"
          disabled={isLoading}
          data-test-id="login-email-input"
        />
        {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Hasło
        </label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          data-test-id="login-password-input"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <a href="/auth/reset-password" className="text-sm text-blue-600 hover:text-blue-800">
          Nie pamiętasz hasła?
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-test-id="login-submit-button">
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Nie masz jeszcze konta?{" "}
        <a href="/auth/register" className="text-blue-600 hover:text-blue-800">
          Zarejestruj się
        </a>
      </p>
    </form>
  );
}
