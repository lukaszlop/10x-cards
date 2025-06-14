import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { useEffect } from "react";

interface ResetPasswordSuccessContentProps {
  email: string;
  variant?: "link-sent" | "password-changed";
}

export function ResetPasswordSuccessContent({ email, variant = "link-sent" }: ResetPasswordSuccessContentProps) {
  useEffect(() => {
    if (variant === "password-changed") {
      const timer = setTimeout(() => {
        window.location.href = "/auth/login";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [variant]);

  if (variant === "password-changed") {
    return (
      <div className="container max-w-md mx-auto py-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-transparent border-2 border-gray-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-gray-900" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Hasło zmienione!</h1>
        <p className="text-gray-600">Twoje hasło zostało pomyślnie zaktualizowane.</p>
        <p className="text-sm text-gray-500 mt-4">Za chwilę zostaniesz przekierowany do strony głównej...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-transparent border-2 border-gray-900  rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-gray-900" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Email został wysłany!</h1>
        <p className="text-gray-600 mb-4">
          Wysłaliśmy link do resetowania hasła na adres:
          <br />
          <strong>{email}</strong>
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Co dalej?
            </h3>
            <ul className="text-sm text-gray-900 space-y-1">
              <li>• Sprawdź swoją skrzynkę email (także folder spam)</li>
              <li>• Kliknij w link do resetowania hasła</li>
              <li>• Ustaw nowe hasło w formularzu</li>
              <li>• Zaloguj się używając nowego hasła</li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              Link będzie ważny przez 1 godzinę
            </p>

            <div className="space-y-2">
              <Button asChild size="lg" className="w-full">
                <a href="/auth/reset-password">Wyślij nowy link</a>
              </Button>
              <p className="text-xs text-center text-gray-500">Jeśli link wygaśnie, możesz łatwo wysłać nowy</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-center text-sm text-gray-600">
              <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
                Powrót do logowania
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
