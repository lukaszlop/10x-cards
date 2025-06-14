import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ResetPasswordSuccessContent } from "./ResetPasswordSuccessContent";

const resetPasswordFormSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się wysłać emaila");
      }

      const result = await response.json();

      // Show success view instead of just toast
      setSentEmail(data.email);
      setEmailSent(true);
      toast.success(result.message);
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show success view after email is sent
  if (emailSent) {
    return <ResetPasswordSuccessContent email={sentEmail} />;
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Nie pamiętasz hasła?</h1>
        <p className="text-gray-600">Podaj swój adres email, a wyślemy Ci link do zresetowania hasła</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Wysyłanie..." : "Wyślij link do resetowania hasła"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Pamiętasz hasło?{" "}
              <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
                Zaloguj się
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
