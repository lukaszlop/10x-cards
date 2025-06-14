import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function ConfirmEmailContent() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = "/auth/login";
    }
  }, [countdown]);

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Konto zostało aktywowane! 🎉</h1>
        <p className="text-gray-600 mb-4">
          Twoja rejestracja została pomyślnie potwierdzona. Możesz się teraz zalogować i korzystać z aplikacji.
        </p>
        <p className="text-sm text-gray-500">Automatyczne przekierowanie za {countdown} sekund...</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Button asChild size="lg" className="w-full">
              <a href="/auth/login">Przejdź do logowania</a>
            </Button>

            <p className="text-sm text-gray-600">
              <a href="/" className="text-blue-600 hover:text-blue-800">
                Powrót na stronę główną
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
