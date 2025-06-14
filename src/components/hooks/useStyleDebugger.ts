import { useEffect, useRef } from "react";

export function useStyleDebugger() {
  const observerRef = useRef<MutationObserver | null>(null);
  const styleSnapshotRef = useRef<Map<string, string>>(new Map());

  const captureStyleSnapshot = () => {
    const styles = document.querySelectorAll("head style");
    const snapshot = new Map<string, string>();

    styles.forEach((style, index) => {
      const content = style.textContent || "";
      const id = style.id || `style-${index}`;
      const isSonner =
        content.includes("sonner") ||
        content.includes("toaster") ||
        style.hasAttribute("data-sonner-toaster") ||
        style.hasAttribute("data-styled");

      if (isSonner || style.id.includes("sonner") || style.id.includes("stndz")) {
        snapshot.set(id, content);
      }
    });

    styleSnapshotRef.current = snapshot;
    return snapshot;
  };

  const compareStyleSnapshots = (before: Map<string, string>, after: Map<string, string>) => {
    // Styles that disappeared
    const removed = new Set([...before.keys()].filter((key) => !after.has(key)));
    const added = new Set([...after.keys()].filter((key) => !before.has(key)));
    const changed = new Set();

    // Styles that changed
    before.forEach((content, id) => {
      if (after.has(id) && after.get(id) !== content) {
        changed.add(id);
      }
    });

    return { removed, added, changed };
  };

  const debugToasterState = () => {
    const toaster = document.querySelector("[data-sonner-toaster]");

    if (!toaster) {
      return;
    }

    const toasts = document.querySelectorAll("[data-sonner-toast]");
    if (toasts.length === 0) {
      return;
    }

    const firstToast = toasts[0] as HTMLElement;
    const toastStyles = getComputedStyle(firstToast);

    // Check if styles look like defaults (indicating missing Sonner styles)
    const hasProperStyles =
      toastStyles.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      toastStyles.backgroundColor !== "transparent" &&
      toastStyles.padding !== "0px";

    return hasProperStyles;
  };

  const startStyleObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Monitor style changes but don't log them
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === "STYLE") {
                const content = element.textContent || "";
                if (
                  content.includes("sonner") ||
                  content.includes("toaster") ||
                  element.id.includes("sonner") ||
                  element.id.includes("stndz")
                ) {
                  // Style added
                }
              }
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === "STYLE") {
                const content = element.textContent || "";
                if (
                  content.includes("sonner") ||
                  content.includes("toaster") ||
                  element.id.includes("sonner") ||
                  element.id.includes("stndz")
                ) {
                  // Style removed
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;
  };

  useEffect(() => {
    // Start observing immediately
    startStyleObserver();

    // Capture initial snapshot
    setTimeout(() => {
      captureStyleSnapshot();
    }, 500);

    // Listen for navigation events
    const handleBeforePreparation = () => {
      captureStyleSnapshot();
    };

    const handleAfterSwap = () => {
      setTimeout(() => {
        const afterSnapshot = captureStyleSnapshot();
        compareStyleSnapshots(styleSnapshotRef.current, afterSnapshot);
        debugToasterState();
      }, 200);
    };

    document.addEventListener("astro:before-preparation", handleBeforePreparation);
    document.addEventListener("astro:after-swap", handleAfterSwap);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.removeEventListener("astro:before-preparation", handleBeforePreparation);
      document.removeEventListener("astro:after-swap", handleAfterSwap);
    };
  }, []);

  return {
    captureSnapshot: captureStyleSnapshot,
    compareSnapshots: compareStyleSnapshots,
    debugToasterState,
    startObserver: startStyleObserver,
  };
}
