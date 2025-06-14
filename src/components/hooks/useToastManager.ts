import { toast } from "sonner";

/**
 * Global singleton Toast Manager
 * Zarządza Sonner toasterem niezależnie od React lifecycle
 */
class GlobalToastManager {
  private isInitialized = false;
  private cleanupFunctions: (() => void)[] = [];

  constructor() {
    // Auto-initialize when first instance is created
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // Function to check if Sonner styles are complete
    const checkSonnerStylesComplete = () => {
      // Check if we have enough Sonner styles in head
      const sonnerStyles = Array.from(document.querySelectorAll("style")).filter((style) => {
        const content = style.textContent || "";
        return (
          content.includes("sonner") ||
          content.includes("toaster") ||
          content.includes("[data-sonner") ||
          style.id.includes("sonner")
        );
      });

      // If less than 3 styles, likely incomplete
      if (sonnerStyles.length < 3) {
        this.forceSonnerStyleReinjection();
      }
    };

    // Function to force Sonner style re-injection
    const forceSonnerStyleReinjection = () => {
      // Method 1: Show and dismiss multiple toasts to trigger style injection
      const tempToasts = [
        toast.success("", { duration: 50, style: { opacity: 0, position: "absolute", left: "-9999px" } }),
        toast.error("", { duration: 50, style: { opacity: 0, position: "absolute", left: "-9999px" } }),
        toast.warning("", { duration: 50, style: { opacity: 0, position: "absolute", left: "-9999px" } }),
      ];

      setTimeout(() => {
        tempToasts.forEach((t) => toast.dismiss(t));

        // Check if styles were injected
        setTimeout(() => {
          const stylesAfter = Array.from(document.querySelectorAll("style")).filter((style) => {
            const content = style.textContent || "";
            return content.includes("sonner") || content.includes("[data-sonner");
          });

          if (stylesAfter.length < 3) {
            this.injectFallbackStyles();
          }
        }, 100);
      }, 100);
    };

    // Store the function for later use
    this.forceSonnerStyleReinjection = forceSonnerStyleReinjection;

    // Function to inject comprehensive fallback styles
    const injectFallbackStyles = () => {
      const fallbackCSS = `
        /* Complete Sonner Fallback Styles */
        [data-sonner-toaster] {
          position: fixed !important;
          z-index: 999999 !important;
          pointer-events: none !important;
          bottom: 16px !important;
          right: 16px !important;
          width: 356px !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
        }

        [data-sonner-toaster] > * {
          pointer-events: auto !important;
        }

        [data-sonner-toast] {
          background: white !important;
          color: black !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 10px !important;
          padding: 16px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.15) !important;
          min-height: 48px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-bottom: 8px !important;
          word-wrap: break-word !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          overflow: hidden !important;
        }

        [data-sonner-toast][data-type="success"] {
          background: #16a34a !important;
          color: white !important;
          border-color: #16a34a !important;
        }

        [data-sonner-toast][data-type="error"] {
          background: #dc2626 !important;
          color: white !important;
          border-color: #dc2626 !important;
        }

        [data-sonner-toast][data-type="warning"] {
          background: #f59e0b !important;
          color: black !important;
          border-color: #f59e0b !important;
        }

        [data-sonner-toast][data-type="info"] {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }

        /* Dark theme support */
        [data-sonner-toaster][data-theme="dark"] [data-sonner-toast] {
          background: #1f2937 !important;
          color: #f9fafb !important;
          border-color: #374151 !important;
        }
      `;

      // Remove existing fallback
      const existingFallback = document.getElementById("global-toaster-fallback");
      if (existingFallback) {
        existingFallback.remove();
      }

      // Inject new fallback
      const styleElement = document.createElement("style");
      styleElement.id = "global-toaster-fallback";
      styleElement.textContent = fallbackCSS;
      document.head.appendChild(styleElement);
    };

    // Store the function for later use
    this.injectFallbackStyles = injectFallbackStyles;

    // Function to clear all toasts
    const clearAllToasts = () => {
      try {
        toast.dismiss();
      } catch (error) {
        console.error("GlobalToastManager: Error clearing toasts:", error);
      }
    };

    // Function to handle navigation cleanup
    const handleNavigationStart = () => {
      clearAllToasts();
    };

    // Function to handle navigation end
    const handleNavigationEnd = () => {
      // Check styles after a delay to allow View Transitions to complete
      setTimeout(() => {
        checkSonnerStylesComplete();
      }, 300);
    };

    // Add event listeners
    try {
      // Astro View Transitions events
      document.addEventListener("astro:before-preparation", handleNavigationStart);
      document.addEventListener("astro:after-swap", handleNavigationEnd);
      document.addEventListener("astro:page-load", handleNavigationEnd);

      // Store cleanup functions
      this.cleanupFunctions = [
        () => document.removeEventListener("astro:before-preparation", handleNavigationStart),
        () => document.removeEventListener("astro:after-swap", handleNavigationEnd),
        () => document.removeEventListener("astro:page-load", handleNavigationEnd),
      ];
    } catch (error) {
      console.error("GlobalToastManager: Error setting up event listeners:", error);
    }
  }

  // Make these methods available on instance
  private forceSonnerStyleReinjection!: () => void;
  private injectFallbackStyles!: () => void;

  // Public API
  showSuccess(message: string) {
    try {
      return toast.success(message);
    } catch (error) {
      console.error("GlobalToastManager: Error showing success toast:", error);
      return toast(message); // Fallback
    }
  }

  showError(message: string) {
    try {
      return toast.error(message);
    } catch (error) {
      console.error("GlobalToastManager: Error showing error toast:", error);
      return toast(message); // Fallback
    }
  }

  showWarning(message: string) {
    try {
      return toast.warning(message);
    } catch (error) {
      console.error("GlobalToastManager: Error showing warning toast:", error);
      return toast(message); // Fallback
    }
  }

  showInfo(message: string) {
    try {
      return toast(message);
    } catch (error) {
      console.error("GlobalToastManager: Error showing info toast:", error);
      return toast(message); // Fallback
    }
  }

  dismiss() {
    try {
      toast.dismiss();
    } catch (error) {
      console.error("GlobalToastManager: Error dismissing toasts:", error);
    }
  }

  // Public method to force style fix
  forceStyleFix() {
    if (this.forceSonnerStyleReinjection) {
      this.forceSonnerStyleReinjection();
    }
  }

  // Cleanup method
  destroy() {
    // Run all cleanup functions
    this.cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error("GlobalToastManager: Error during cleanup:", error);
      }
    });

    // Clear remaining toasts
    this.dismiss();

    // Reset initialization flag
    this.isInitialized = false;
  }
}

// Create global singleton instance
const globalToastManager = new GlobalToastManager();

/**
 * Hook that returns the global toast manager
 * Now just returns the singleton instance without creating multiple managers
 */
export function useToastManager() {
  return {
    showSuccess: (message: string) => globalToastManager.showSuccess(message),
    showError: (message: string) => globalToastManager.showError(message),
    showWarning: (message: string) => globalToastManager.showWarning(message),
    showInfo: (message: string) => globalToastManager.showInfo(message),
    dismiss: () => globalToastManager.dismiss(),
    forceStyleFix: () => globalToastManager.forceStyleFix(),
  };
}
