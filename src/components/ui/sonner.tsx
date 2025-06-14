import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

interface ToasterProps {
  theme?: "light" | "dark" | "system";
  className?: string;
  style?: React.CSSProperties;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
}

function useAstroTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;

    const updateTheme = () => {
      const currentTheme = savedTheme || "system";
      setTheme(currentTheme);
    };

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  return theme;
}

export function Toaster({ ...props }: Partial<ToasterProps>) {
  const theme = useAstroTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--primary)",
          "--success-text": "var(--primary-foreground)",
          "--warning-bg": "var(--muted)",
          "--warning-text": "var(--muted-foreground)",
          "--error-bg": "var(--destructive)",
          "--error-text": "var(--primary-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
