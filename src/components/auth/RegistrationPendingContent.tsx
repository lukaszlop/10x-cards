import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RegistrationPendingContentProps {
  email?: string;
}

export function RegistrationPendingContent({ email }: RegistrationPendingContentProps) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Brak adresu email. Przejdź przez formularz rejestracji ponownie.");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Email aktywacyjny został wysłany ponownie");
        setCountdown(60);
        setCanResend(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Nie udało się wysłać emaila");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      toast.error("Wystąpił błąd sieci");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-transparent border-2 border-gray-900 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-gray-900" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Sprawdź swoją skrzynkę email</h1>
        <p className="text-gray-600 mb-4">
          Wysłaliśmy link aktywacyjny na podany adres email. Kliknij w link, aby aktywować swoje konto.
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
              <li>• Kliknij w link aktywacyjny w emailu</li>
              <li>• Zostaniesz automatycznie zalogowany</li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">Nie otrzymałeś emaila?</p>

            <div className="space-y-2">
              <Button
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
                className="w-full bg-black text-white hover:bg-gray-900"
                size="lg"
              >
                {isResending ? "Wysyłanie..." : "Wyślij ponownie"}
              </Button>

              {!canResend && (
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Możesz wysłać email ponownie za {countdown} sekund
                </p>
              )}
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
