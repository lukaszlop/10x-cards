import { useTheme } from "next-themes";
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

export function Toaster({ ...props }: Partial<ToasterProps>) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
