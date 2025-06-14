import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/db/supabase";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResetPasswordSuccessContent } from "./ResetPasswordSuccessContent";

export function ResetPasswordConfirmContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // When the component mounts, Supabase client automatically handles the
    // token from the URL. We just need to check if a session is established.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If a session exists, it means the recovery link was valid.
        setUserEmail(session.user.email ?? null);
        setStatus("ready");
      } else {
        // If no session is found after the client has initialized, the link is invalid.
        setStatus("error");
      }
    });
  }, []); // The empty dependency array ensures this effect runs only once.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Hasła nie są identyczne");
      return;
    }

    if (password.length < 8) {
      toast.error("Hasło musi mieć co najmniej 8 znaków");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        if (error.code === "same_password") {
          toast.error("Nowe hasło musi różnić się od aktualnego.");
        } else {
          toast.error(error.message || "Wystąpił błąd podczas aktualizacji hasła.");
        }
      } else {
        toast.success("Hasło zostało zmienione pomyślnie!");
        setIsPasswordSet(true);
      }
    } catch (error) {
      console.error("Reset password confirm error:", error);
      toast.error("Wystąpił błąd sieci");
    } finally {
      setIsLoading(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

  if (isPasswordSet) {
    return <ResetPasswordSuccessContent email={userEmail || ""} variant="password-changed" />;
  }

  if (status === "loading") {
    return (
      <div className="container max-w-md mx-auto py-8 text-center">
        <p>Weryfikowanie linku do odzyskiwania hasła...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container max-w-md mx-auto py-8 text-center">
        <p className="text-red-500">Link jest nieprawidłowy lub wygasł.</p>
        <a href="/auth/reset-password" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Poproś o nowy link
        </a>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-transparent border-2 border-gray-900 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-900" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Ustaw nowe hasło</h1>
        <p className="text-gray-600">Wprowadź swoje nowe hasło poniżej</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Nowe hasło</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={"password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={"password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Ustawianie..." : "Ustaw nowe hasło"}
            </Button>

            <div className="text-center">
              <a href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800">
                Powrót do logowania
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
