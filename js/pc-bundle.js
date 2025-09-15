/**
 * Debug Utility for KAUKA
 * Provides conditional console logging based on KAUKA_CONFIG.debug setting
 * Prevents console.log execution in production builds
 */

/**
 * Debug logger that only outputs when debug mode is enabled
 * @param {string} level - Log level: 'log', 'warn', 'error', 'debug', 'info'
 * @param {string} module - Module name (e.g., '[Home]', '[Gallery]')
 * @param {...any} args - Arguments to pass to console
 */
function debugLog(level, module, ...args) {
  // Check if KAUKA_CONFIG exists and debug is enabled
  if (
    typeof window !== "undefined" &&
    window.KAUKA_CONFIG &&
    window.KAUKA_CONFIG.debug === true
  ) {
    // Ensure the console method exists
    if (console && typeof console[level] === "function") {
      console[level](module, ...args);
    }
  }
}

/**
 * Debug utility object with different log levels
 */
const Debug = {
  /**
   * Log informational messages
   * @param {string} module - Module name
   * @param {...any} args - Arguments to log
   */
  log: (module, ...args) => debugLog("log", module, ...args),

  /**
   * Log warning messages
   * @param {string} module - Module name
   * @param {...any} args - Arguments to log
   */
  warn: (module, ...args) => debugLog("warn", module, ...args),

  /**
   * Log error messages
   * @param {string} module - Module name
   * @param {...any} args - Arguments to log
   */
  error: (module, ...args) => debugLog("error", module, ...args),

  /**
   * Log debug messages
   * @param {string} module - Module name
   * @param {...any} args - Arguments to log
   */
  debug: (module, ...args) => debugLog("debug", module, ...args),

  /**
   * Log info messages
   * @param {string} module - Module name
   * @param {...any} args - Arguments to log
   */
  info: (module, ...args) => debugLog("info", module, ...args),

  /**
   * Check if debug mode is enabled
   * @returns {boolean} True if debug mode is enabled
   */
  isEnabled: () => {
    return (
      typeof window !== "undefined" &&
      window.KAUKA_CONFIG &&
      window.KAUKA_CONFIG.debug === true
    );
  },
};

// Export for use in other modules
if (typeof window !== "undefined") {
  window.Debug = Debug;
}

;
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
  Debug.log("[HorizontalScroll]", "Initializing for selector:aaa", selector);
  Debug.log(
    "[HorizontalScroll]",
    "Scrollable element selector:",
    scrollableElementSelector
  );
  Debug.log("[HorizontalScroll]", "Options:", options);

  // Check if we should disable horizontal scroll on medium breakpoints and up
  function shouldDisableHorizontalScroll() {
    // Check if window width is medium (768px) or larger
    return window.innerWidth >= 768;
  }

  // If horizontal scroll should be disabled, return early
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

  // Set container height to fill remaining viewport
  const homeContainer = document.querySelector(".home-componente");
  if (homeContainer) {
    const remainingHeight = `calc(100vh - ${headerHeight}px)`;
    homeContainer.style.minHeight = remainingHeight;
    Debug.log(
      "[HorizontalScroll]",
      "Container min-height set to:",
      remainingHeight
    );
  }

  // Default options
  const defaultOptions = {
    trigger: selector,
    start: `top ${headerHeight}px`,
    end: () =>
      "+=" +
      (document.querySelector(scrollableElementSelector).scrollWidth -
        window.innerWidth),
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      Debug.log("[HorizontalScroll]", "Progress:", self.progress);
    },
  };

  const config = { ...defaultOptions, ...options };
  Debug.log("[HorizontalScroll]", "Final config:", config);

  // Check if GSAP and ScrollTrigger are available
  if (typeof gsap === "undefined") {
    Debug.error("[HorizontalScroll]", "GSAP is not available");
    return null;
  }

  if (typeof ScrollTrigger === "undefined") {
    Debug.error("[HorizontalScroll]", "ScrollTrigger is not available");
    return null;
  }

  // Wait for DOM elements to be available
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
  Debug.log(
    "[HorizontalScroll]",
    "Scrollable width:",
    scrollableElement.scrollWidth
  );
  Debug.log("[HorizontalScroll]", "Window width:", window.innerWidth);
  Debug.log(
    "[HorizontalScroll]",
    "Distance to scroll:",
    scrollableElement.scrollWidth - window.innerWidth
  );

  // Create the horizontal scroll animation
  const scrollTween = gsap.to(scrollableElement, {
    x: () => -(scrollableElement.scrollWidth - window.innerWidth),
    ease: "none",
  });

  Debug.log("[HorizontalScroll]", "Scroll tween created:", scrollTween);

  // Create ScrollTrigger
  const scrollTrigger = ScrollTrigger.create({
    ...config,
    animation: scrollTween,
    onUpdate: (self) => {
      if (config.onUpdate) {
        config.onUpdate(self);
      }
      Debug.log(
        "[HorizontalScroll]",
        `Progress: ${self.progress.toFixed(3)}, Direction: ${self.direction}`
      );
    },
    onToggle: (self) => {
      Debug.log("[HorizontalScroll]", `Toggled - Active: ${self.isActive}`);
    },
    onRefresh: () => {
      Debug.log("[HorizontalScroll]", "Refreshed");
    },
  });

  Debug.log("[HorizontalScroll]", "ScrollTrigger created:", scrollTrigger);

  return {
    scrollTrigger,
    scrollTween,
    container,
    scrollableElement,
    refresh: () => {
      Debug.log("[HorizontalScroll]", "Manual refresh called");
      ScrollTrigger.refresh();
    },
    kill: () => {
      Debug.log("[HorizontalScroll]", "Killing ScrollTrigger");
      scrollTrigger.kill();
    },
  };
}

/**
 * Initialize home page horizontal scroll
 */
function initHomeHorizontalScroll(outer, inner) {
  Debug.log("[HorizontalScroll]", "Initializing home page horizontal scroll");

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    Debug.log("[HorizontalScroll]", "DOM still loading, waiting...");
    document.addEventListener("DOMContentLoaded", initHomeHorizontalScroll);
    return;
  }

  let horizontalScroll = null;

  // Function to initialize or destroy horizontal scroll based on screen size
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
      // Initialize the horizontal scroll for home page componentes section
      horizontalScroll = initHorizontalScroll(outer, inner, {
        onUpdate: (self) => {
          // Custom update logic for home page if needed
          Debug.log(
            "[HomeHorizontalScroll]",
            `Progress: ${self.progress.toFixed(3)}`
          );
        },
      });

      // Store reference globally for debugging
      if (horizontalScroll) {
        window.homeHorizontalScroll = horizontalScroll;
        Debug.log(
          "[HorizontalScroll]",
          "Home horizontal scroll initialized and stored globally"
        );
      }
    }
  }

  // Initialize based on current screen size
  handleHorizontalScroll();

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleHorizontalScroll();
    }, 250); // Debounce resize events
  });

  return horizontalScroll;
}
