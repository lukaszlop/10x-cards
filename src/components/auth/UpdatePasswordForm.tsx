import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const updatePasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;

interface UpdatePasswordFormProps {
  onSubmit: (data: UpdatePasswordFormData) => void;
  isLoading?: boolean;
}

export function UpdatePasswordForm({ onSubmit, isLoading = false }: UpdatePasswordFormProps) {
  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Nowe hasło
        </label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Potwierdź nowe hasło
        </label>
        <Input
          id="confirmPassword"
          type="password"
          {...form.register("confirmPassword")}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Aktualizacja..." : "Ustaw nowe hasło"}
      </Button>
    </form>
  );
}
