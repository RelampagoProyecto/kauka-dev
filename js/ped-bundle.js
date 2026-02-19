/**
 * Horizontal scrolling functionality using GSAP ScrollTrigger
 */

/**
 * Initialize horizontal scroll container
 * @param {string} selector - CSS selector for the horizontal scroll container
 * @param {string} scrollableElementSelector - CSS selector for the scrollable element inside container
 * @param {Object} options - Configuration options
 */
function initHorizontalScroll(
  selector,
  scrollableElementSelector,
  options = {}
) {
  Debug.log("[HorizontalScroll]", "Initializing for selector:", selector);
  Debug.log(
    "[HorizontalScroll]",
    "Scrollable element selector:",
    scrollableElementSelector
  );
  Debug.log("[HorizontalScroll]", "Options:", options);

  // Check if we should disable horizontal scroll on medium breakpoints and up
  function shouldDisableHorizontalScroll() {
    return window.innerWidth >= 768;
  }

  if (shouldDisableHorizontalScroll()) {
    Debug.log(
      "[HorizontalScroll]",
      "Disabled on medium breakpoints and up (>= 768px)"
    );
    return null;
  }

  // Get header height
  const header = document.querySelector("#nav");
  const headerHeight = header ? header.offsetHeight : 0;
  Debug.log("[HorizontalScroll]", "Header height:", headerHeight + "px");

  // Get DOM elements
  const container = document.querySelector(selector);
  const scrollableElement = document.querySelector(scrollableElementSelector);

  if (!container) {
    Debug.error("[HorizontalScroll]", `Container ${selector} not found`);
    return null;
  }

  if (!scrollableElement) {
    Debug.error(
      "[HorizontalScroll]",
      `Scrollable element ${scrollableElementSelector} not found`
    );
    return null;
  }

  Debug.log("[HorizontalScroll]", "Container:", container);
  Debug.log("[HorizontalScroll]", "Scrollable element:", scrollableElement);

  // ✅ SOLUCIÓN FINAL: Usar scroll horizontal NATIVO sin GSAP
  // NO crear ScrollTrigger porque pin: true siempre crea espacios en blanco
  Debug.log(
    "[HorizontalScroll]",
    "Using NATIVE horizontal scroll (NO GSAP, NO pin)"
  );

  // Habilitar scroll horizontal nativo con CSS
  container.style.overflowX = "auto";
  container.style.overflowY = "hidden";
  container.style.webkitOverflowScrolling = "touch";

  // Log de información para debug
  const containerWidth = container.offsetWidth;
  const scrollWidth = scrollableElement.scrollWidth;
  const scrollableDistance = scrollWidth - containerWidth;

  Debug.log("[HorizontalScroll]", "Container width:", containerWidth);
  Debug.log("[HorizontalScroll]", "Scrollable width:", scrollWidth);
  Debug.log(
    "[HorizontalScroll]",
    "Total scrollable distance:",
    scrollableDistance
  );
  Debug.log(
    "[HorizontalScroll]",
    "Native scroll enabled - no white space will be created"
  );

  return {
    scrollTrigger: null,
    scrollTween: null,
    container,
    scrollableElement,
    refresh: () => {
      Debug.log("[HorizontalScroll]", "Refresh called (native scroll)");
    },
    kill: () => {
      Debug.log("[HorizontalScroll]", "Kill called - removing native scroll");
      container.style.overflowX = "";
      container.style.overflowY = "";
      container.style.webkitOverflowScrolling = "";
    },
  };
}

/**
 * Initialize home page horizontal scroll
 */
function initHomeHorizontalScroll(outer, inner) {
  Debug.log("[HorizontalScroll]", "Initializing home page horizontal scroll");
  Debug.log("[HorizontalScroll]", "Outer selector:", outer);
  Debug.log("[HorizontalScroll]", "Inner selector:", inner);

  if (document.readyState === "loading") {
    Debug.log("[HorizontalScroll]", "DOM still loading, waiting...");
    document.addEventListener("DOMContentLoaded", () => {
      initHomeHorizontalScroll(outer, inner);
    });
    return;
  }

  let horizontalScroll = null;

  function handleHorizontalScroll() {
    const shouldDisable = window.innerWidth >= 768;

    if (shouldDisable && horizontalScroll) {
      Debug.log(
        "[HorizontalScroll]",
        "Destroying horizontal scroll for medium+ breakpoint"
      );
      horizontalScroll.kill();
      horizontalScroll = null;
    } else if (!shouldDisable && !horizontalScroll) {
      Debug.log(
        "[HorizontalScroll]",
        "Creating horizontal scroll for small breakpoint"
      );

      horizontalScroll = initHorizontalScroll(outer, inner, {
        onUpdate: (self) => {
          Debug.log(
            "[HomeHorizontalScroll]",
            `Progress: ${self.progress.toFixed(3)}`
          );
        },
      });

      if (horizontalScroll) {
        window.homeHorizontalScroll = horizontalScroll;
        Debug.log(
          "[HorizontalScroll]",
          "Home horizontal scroll initialized and stored globally"
        );
      }
    }
  }

  handleHorizontalScroll();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleHorizontalScroll();
    }, 250);
  });

  return horizontalScroll;
}
