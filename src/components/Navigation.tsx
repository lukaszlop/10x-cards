import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../db/supabase.client";
import { userStore } from "../stores/userStore";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useStore(userStore);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      userStore.set(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      userStore.set(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      toast.success("Wylogowano pomyślnie");
      window.location.href = "/login";
    } catch {
      toast.error("Wystąpił błąd podczas wylogowywania");
    }
  };

  // Prevent body scroll when mobile menu is open
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

  return (
    <div className="relative">
      {/* Mobile menu overlay and container */}
      <div
        className={`md:hidden fixed inset-0 z-[100] ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Dark overlay behind the drawer */}
        <div
          className={`
            fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300
            ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile navigation menu */}
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
                className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Generowanie fiszek
              </a>
              <a
                href="/flashcards"
                className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Moje fiszki
              </a>

              {/* Mobile user section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  {!isLoading &&
                    (user ? (
                      <>
                        <div className="text-sm text-gray-600 mb-2">{user.email}</div>
                        <button
                          onClick={handleLogout}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left"
                        >
                          Wyloguj
                        </button>
                      </>
                    ) : (
                      <a
                        href="/login"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left block text-center"
                      >
                        Zaloguj się
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-white/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none border-b-2 border-gray-200/50 fixed inset-x-0 top-0 h-16 z-[90]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between h-full">
            {/* Left side: Logo and main navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <a
                  href="/generations"
                  className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  10xCards
                </a>
              </div>

              {/* Desktop navigation links */}
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

            {/* Right side: User info and logout */}
            <div className="flex items-center">
              {/* Desktop user menu */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                {!isLoading &&
                  (user ? (
                    <>
                      <span className="text-sm text-gray-600">{user.email}</span>
                      <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <a
                      href="/login"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Zaloguj się
                    </a>
                  ))}
              </div>

              {/* Mobile menu button */}
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
