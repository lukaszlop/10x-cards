import { useCallback } from "react";
import { toast } from "sonner";

export function useSonnerStyleFixer() {
  const extractSonnerStyles = useCallback(() => {
    // Try to find existing Sonner styles in the DOM
    const existingStyles = Array.from(document.querySelectorAll("style")).filter((style) => {
      const content = style.textContent || "";
      return (
        content.includes("[data-sonner") ||
        content.includes("sonner") ||
        style.id.includes("sonner") ||
        style.id.includes("stndz")
      );
    });

    return existingStyles;
  }, []);

  const createBasicSonnerStyles = useCallback(() => {
    // Create basic Sonner styles as fallback
    const styleContent = `
      [data-sonner-toaster] {
        position: fixed !important;
        z-index: 999999 !important;
        pointer-events: none !important;
        bottom: 16px !important;
        right: 16px !important;
      }

      [data-sonner-toaster] > * {
        pointer-events: auto !important;
      }

      [data-sonner-toast] {
        background: white !important;
        color: black !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 0.5rem !important;
        padding: 16px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        box-shadow: 0 4px 12px rgb(0 0 0 / 0.15) !important;
        min-height: 48px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        word-wrap: break-word !important;
        transition: all 0.3s ease !important;
        margin-bottom: 8px !important;
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
        background: #f3f4f6 !important;
        color: #374151 !important;
        border-color: #f3f4f6 !important;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.id = "sonner-fallback-styles";
    styleElement.textContent = styleContent;

    // Remove existing fallback if any
    const existing = document.getElementById("sonner-fallback-styles");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(styleElement);

    return styleElement;
  }, []);

  const forceSonnerReinitialization = useCallback(async () => {
    // Step 1: Clear any existing toasts
    toast.dismiss();

    // Step 2: Wait for cleanup
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Step 3: Try to access Sonner's internal state and force re-render
    // This is a hack to trigger Sonner's internal style injection
    const toaster = document.querySelector("[data-sonner-toaster]");

    if (toaster) {
      // Force DOM refresh
      const parent = toaster.parentNode;
      const nextSibling = toaster.nextSibling;

      if (parent) {
        parent.removeChild(toaster);
        setTimeout(() => {
          if (nextSibling) {
            parent.insertBefore(toaster, nextSibling);
          } else {
            parent.appendChild(toaster);
          }

          // Trigger a re-render by showing and quickly dismissing a toast
          setTimeout(() => {
            const testToast = toast("", { duration: 1 });
            setTimeout(() => toast.dismiss(testToast), 10);
          }, 10);
        }, 10);
      }
    } else {
      // If no toaster exists, create one by showing a toast
      const testToast = toast("", { duration: 1 });
      setTimeout(() => toast.dismiss(testToast), 50);
    }

    // Step 4: Inject fallback styles as backup
    setTimeout(() => {
      createBasicSonnerStyles();
    }, 100);
  }, [createBasicSonnerStyles]);

  const checkAndFixStyles = useCallback(async () => {
    extractSonnerStyles(); // Just for logging, result not used
    const toaster = document.querySelector("[data-sonner-toaster]");

    if (!toaster) {
      await forceSonnerReinitialization();
      return;
    }

    const toasts = document.querySelectorAll("[data-sonner-toast]");
    if (toasts.length === 0) {
      return;
    }

    const firstToast = toasts[0] as HTMLElement;
    const styles = getComputedStyle(firstToast);

    const hasProperStyles =
      styles.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      styles.backgroundColor !== "transparent" &&
      styles.padding !== "0px" &&
      styles.borderRadius !== "0px";

    if (!hasProperStyles) {
      await forceSonnerReinitialization();
    }
  }, [extractSonnerStyles, forceSonnerReinitialization]);

  return {
    extractStyles: extractSonnerStyles,
    createFallbackStyles: createBasicSonnerStyles,
    forceReinit: forceSonnerReinitialization,
    checkAndFix: checkAndFixStyles,
  };
}
