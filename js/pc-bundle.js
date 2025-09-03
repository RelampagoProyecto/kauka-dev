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
  console.log("[HorizontalScroll] Initializing for selector:aaa", selector);
  console.log(
    "[HorizontalScroll] Scrollable element selector:",
    scrollableElementSelector
  );
  console.log("[HorizontalScroll] Options:", options);

  // Check if we should disable horizontal scroll on medium breakpoints and up
  function shouldDisableHorizontalScroll() {
    // Check if window width is medium (768px) or larger
    return window.innerWidth >= 768;
  }

  // If horizontal scroll should be disabled, return early
  if (shouldDisableHorizontalScroll()) {
    console.log(
      "[HorizontalScroll] Disabled on medium breakpoints and up (>= 768px)"
    );
    return null;
  }

  // Get header height
  const header = document.querySelector("#nav");
  const headerHeight = header ? header.offsetHeight : 0;
  console.log("[HorizontalScroll] Header height:", headerHeight + "px");

  // Set container height to fill remaining viewport
  const homeContainer = document.querySelector(".home-componente");
  if (homeContainer) {
    const remainingHeight = `calc(100vh - ${headerHeight}px)`;
    homeContainer.style.minHeight = remainingHeight;
    console.log(
      "[HorizontalScroll] Container min-height set to:",
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
      console.log("[HorizontalScroll] Progress:", self.progress);
    },
  };

  const config = { ...defaultOptions, ...options };
  console.log("[HorizontalScroll] Final config:", config);

  // Check if GSAP and ScrollTrigger are available
  if (typeof gsap === "undefined") {
    console.error("[HorizontalScroll] GSAP is not available");
    return null;
  }

  if (typeof ScrollTrigger === "undefined") {
    console.error("[HorizontalScroll] ScrollTrigger is not available");
    return null;
  }

  // Wait for DOM elements to be available
  const container = document.querySelector(selector);
  const scrollableElement = document.querySelector(scrollableElementSelector);

  if (!container) {
    console.error(`[HorizontalScroll] Container ${selector} not found`);
    return null;
  }

  if (!scrollableElement) {
    console.error(
      `[HorizontalScroll] Scrollable element ${scrollableElementSelector} not found`
    );
    return null;
  }

  console.log("[HorizontalScroll] Container:", container);
  console.log("[HorizontalScroll] Scrollable element:", scrollableElement);
  console.log(
    "[HorizontalScroll] Scrollable width:",
    scrollableElement.scrollWidth
  );
  console.log("[HorizontalScroll] Window width:", window.innerWidth);
  console.log(
    "[HorizontalScroll] Distance to scroll:",
    scrollableElement.scrollWidth - window.innerWidth
  );

  // Create the horizontal scroll animation
  const scrollTween = gsap.to(scrollableElement, {
    x: () => -(scrollableElement.scrollWidth - window.innerWidth),
    ease: "none",
  });

  console.log("[HorizontalScroll] Scroll tween created:", scrollTween);

  // Create ScrollTrigger
  const scrollTrigger = ScrollTrigger.create({
    ...config,
    animation: scrollTween,
    onUpdate: (self) => {
      if (config.onUpdate) {
        config.onUpdate(self);
      }
      console.log(
        `[HorizontalScroll] Progress: ${self.progress.toFixed(3)}, Direction: ${self.direction}`
      );
    },
    onToggle: (self) => {
      console.log(`[HorizontalScroll] Toggled - Active: ${self.isActive}`);
    },
    onRefresh: () => {
      console.log("[HorizontalScroll] Refreshed");
    },
  });

  console.log("[HorizontalScroll] ScrollTrigger created:", scrollTrigger);

  return {
    scrollTrigger,
    scrollTween,
    container,
    scrollableElement,
    refresh: () => {
      console.log("[HorizontalScroll] Manual refresh called");
      ScrollTrigger.refresh();
    },
    kill: () => {
      console.log("[HorizontalScroll] Killing ScrollTrigger");
      scrollTrigger.kill();
    },
  };
}

/**
 * Initialize home page horizontal scroll
 */
function initHomeHorizontalScroll(outer, inner) {
  console.log("[HorizontalScroll] Initializing home page horizontal scroll");

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    console.log("[HorizontalScroll] DOM still loading, waiting...");
    document.addEventListener("DOMContentLoaded", initHomeHorizontalScroll);
    return;
  }

  let horizontalScroll = null;

  // Function to initialize or destroy horizontal scroll based on screen size
  function handleHorizontalScroll() {
    const shouldDisable = window.innerWidth >= 768;

    if (shouldDisable && horizontalScroll) {
      console.log(
        "[HorizontalScroll] Destroying horizontal scroll for medium+ breakpoint"
      );
      horizontalScroll.kill();
      horizontalScroll = null;
    } else if (!shouldDisable && !horizontalScroll) {
      console.log(
        "[HorizontalScroll] Creating horizontal scroll for small breakpoint"
      );
      // Initialize the horizontal scroll for home page componentes section
      horizontalScroll = initHorizontalScroll(outer, inner, {
        onUpdate: (self) => {
          // Custom update logic for home page if needed
          console.log(
            `[HomeHorizontalScroll] Progress: ${self.progress.toFixed(3)}`
          );
        },
      });

      // Store reference globally for debugging
      if (horizontalScroll) {
        window.homeHorizontalScroll = horizontalScroll;
        console.log(
          "[HorizontalScroll] Home horizontal scroll initialized and stored globally"
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
