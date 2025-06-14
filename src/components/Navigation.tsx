import { supabase } from "@/db/supabase";
import { $user, setUser } from "@/store/auth";
import { useStore } from "@nanostores/react";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useToastManager } from "./hooks/useToastManager";

interface NavigationProps {
  initialUser: User | null;
}

export const Navigation = ({ initialUser }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useStore($user);
  const [isAuthPage, setIsAuthPage] = useState(false);
  const toastManager = useToastManager();

  useEffect(() => {
    // Check if on any auth page on the client
    setIsAuthPage(window.location.pathname.startsWith("/auth/"));

    setUser(initialUser);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toastManager.showError(`Wystąpił błąd podczas wylogowywania: ${error.message}`);
      } else {
        toastManager.showSuccess("Wylogowano pomyślnie. Do zobaczenia!");
        setTimeout(() => {
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              window.location.href = "/auth/login";
            });
          } else {
            window.location.href = "/auth/login";
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Logout error:", err);
      toastManager.showError("Wystąpił nieoczekiwany błąd");
    }
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const shouldShowUser = user && !isAuthPage;

  return (
    <div className="relative">
      <div
        className={`md:hidden fixed inset-0 z-[100] ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`
            fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300
            ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        <div className="fixed inset-x-0 top-16">
          <div
            className={`
              bg-white shadow-lg
              transform transition-all duration-300 ease-in-out origin-top
              ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
            `}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
              <a
                href="/generations"
                onClick={handleMobileNavClick}
                className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Generowanie fiszek
              </a>
              <a
                href="/flashcards"
                onClick={handleMobileNavClick}
                className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Moje fiszki
              </a>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  {shouldShowUser ? (
                    <>
                      <div className="text-sm text-gray-600 mb-2">{user.email}</div>
                      <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left cursor-pointer"
                      >
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <a
                      href="/auth/login"
                      onClick={handleMobileNavClick}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left block text-center"
                    >
                      Zaloguj się
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none border-b-2 border-gray-200/50 fixed inset-x-0 top-0 h-16 z-[90]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between h-full">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                  10xCards
                </a>
              </div>

              <div className="hidden md:ml-4 lg:ml-8 md:flex md:items-center md:space-x-2 lg:space-x-8">
                <a
                  href="/generations"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors flex items-center h-16"
                >
                  Generowanie fiszek
                </a>
                <a
                  href="/flashcards"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors flex items-center h-16"
                >
                  Moje fiszki
                </a>
              </div>
            </div>

            <div className="flex items-center">
              <div className="hidden md:flex md:items-center md:space-x-4">
                {shouldShowUser ? (
                  <>
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      Wyloguj
                    </button>
                  </>
                ) : (
                  <a
                    href="/auth/login"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Zaloguj się
                  </a>
                )}
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="relative z-[110] text-gray-500 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
