import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const resetPasswordFormSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void;
  isLoading?: boolean;
}

export function ResetPasswordForm({ onSubmit, isLoading = false }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Adres email
        </label>
        <Input id="email" type="email" {...form.register("email")} placeholder="twoj@email.com" autoComplete="email" />
        {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Wysyłanie..." : "Wyślij link do resetowania hasła"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Pamiętasz hasło?{" "}
        <a href="/login" className="text-blue-600 hover:text-blue-800">
          Zaloguj się
        </a>
      </p>
    </form>
  );
}
