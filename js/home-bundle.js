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
 * Breakpoint utilities for responsive behavior
 * Matches Tailwind CSS breakpoints
 */

/**
 * Get current Tailwind CSS breakpoint based on window width
 * @returns {string} Current breakpoint ('all', 'sm', 'md', 'lg', 'xl', '2xl')
 */
function getBreakpoint() {
  if (window.innerWidth >= 1536) return "2xl";
  if (window.innerWidth >= 1280) return "xl";
  if (window.innerWidth >= 1024) return "lg";
  if (window.innerWidth >= 768) return "md";
  if (window.innerWidth >= 640) return "sm";
  return "all";
}

;
/**
 * General utility functions
 */

/**
 * Get a random element from an array
 * @param {Array} array - Array to select random element from
 * @returns {*} Random element from the array, or null if array is empty
 */
function getRandomElement(array) {
  if (!array || array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Check if an image is loaded
 * @param {HTMLImageElement} img - Image element to check
 * @returns {boolean} True if image is loaded
 */
function isImageLoaded(img) {
  // For SVG images, check if complete is true
  // For regular images, also check naturalHeight
  return img.complete && (img.naturalHeight !== 0 || img.src.includes(".svg"));
}

;
/**
 * Image utilities for dynamic image loading and responsive behavior
 */

/**
 * Set a random responsive image for a given element
 * @param {Array} imageList - Array of image objects with breakpoint keys
 * @param {string} id - Element ID containing the img tag to update
 */
function getRandomImage(imageList, id) {
  // Use getRandomElement to select a random image set
  const randomImageSet = getRandomElement(imageList);
  if (randomImageSet) {
    const bp = getBreakpoint();

    // Update the img src for the current breakpoint
    const imgEl = document.querySelector(`#${id} img`);
    if (imgEl) {
      imgEl.src = randomImageSet[bp];
    }
  }
}

/**
 * Get responsive image URL for current breakpoint from artist image data
 * @param {Object} imagen - Image object with responsive URLs
 * @returns {string} Responsive image URL for current breakpoint
 */
function getResponsiveImageUrl(imagen) {
  const bp = getBreakpoint();
  return imagen.responsive[bp] || imagen.original.src;
}

;
/**
 * Data fetching utilities for external content
 */

/**
 * Fetch programa-curatorial data from Hugo JSON endpoint
 * @param {string} baseURL - Base URL for the site
 * @returns {Promise<Array>} Promise resolving to array of programa-curatorial pages
 */
function fetchProgramaCuratorial(baseURL = "") {
  return fetch(`${baseURL}/programa-curatorial/index.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      Debug.log("[API]", "Programa Curatorial data:", data);
      return data;
    })
    .catch((error) => {
      Debug.error("[API]", "Error fetching programa-curatorial data:", error);
      return [];
    });
}

/**
 * Fetch artists data with responsive images from Hugo JSON endpoint
 * @param {string} baseURL - Base URL for the site
 * @returns {Promise<Array>} Promise resolving to array of artists with image galleries
 */
function fetchArtists(baseURL = "") {
  return fetch(`${baseURL}/artistas/index.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      Debug.log("[API]", `Found ${data.length} artists with image galleries`);
      return data;
    })
    .catch((error) => {
      Debug.error("[API]", "Error fetching artists data:", error);
      return [];
    });
}

;
/**
 * Extra Content Section Scroll Animation
 * Implements GSAP scroll animations when .home-extra-content-section enters viewport
 */

// Wait for images to load before calculating positions
function waitForImageLoad(img) {
  return new Promise((resolve) => {
    if (img.complete && img.naturalHeight > 0) {
      resolve();
    } else {
      img.addEventListener("load", resolve);
      img.addEventListener("error", resolve); // Resolve even on error
    }
  });
}

/**
 * Get the currently visible image from responsive image set
 */
function getCurrentVisibleImage() {
  const images = document.querySelectorAll("#home-img img");

  for (const img of images) {
    const computedStyle = window.getComputedStyle(img);
    if (computedStyle.display !== "none") {
      Debug.log(`[BgImageScroll] Found visible image: ${img.src}`);
      return img;
    }
  }

  // Fallback to first image if none are detected as visible
  Debug.warn("[BgImageScroll] No visible image detected, using first image");
  return images[0] || null;
}

/**
 * Get breakpoint-specific scroll trigger settings
 */
function getBreakpointScrollSettings() {
  const width = window.innerWidth;

  // Define breakpoints matching Tailwind's defaults
  if (width >= 1536) {
    // 2xl
    return {
      start: "top 30%",
      end: "bottom 10%",
    };
  } else if (width >= 1280) {
    // xl
    return {
      start: "top 25%",
      end: "bottom 5%",
    };
  } else if (width >= 1024) {
    // lg
    return {
      start: "top 20%",
      end: "bottom 0%",
    };
  } else if (width >= 768) {
    // md
    return {
      start: "top 15%",
      end: "bottom -5%",
    };
  } else if (width >= 640) {
    // sm
    return {
      start: "top 10%",
      end: "bottom -10%",
    };
  } else {
    // base (mobile)
    return {
      start: "top 5%",
      end: "bottom -15%",
    };
  }
}

/**
 * Initialize scroll animations for the extra content section
 */
async function initBgImageScroll() {
  Debug.log("[BgImageScroll] Initializing scroll animations");

  // Check if GSAP and ScrollTrigger are available
  if (typeof gsap === "undefined") {
    Debug.error("[BgImageScroll] GSAP is not available");
    return;
  }

  if (typeof ScrollTrigger === "undefined") {
    Debug.error("[BgImageScroll] ScrollTrigger is not available");
    return;
  }

  // Wait for DOM elements to be available
  const bgImage = document.querySelector(".home-content-bg-image");
  const extraContentSection = document.querySelector("#home-content");
  const logo = getCurrentVisibleImage();
  // Get breakpoint-specific settings
  const scrollSettings = getBreakpointScrollSettings();

  if (!bgImage) {
    Debug.error("[BgImageScroll] .home-extra-content-section not found");
    return;
  }

  if (!extraContentSection) {
    Debug.error("[BgImageScroll] .home-extra-content-column not found");
    return;
  }

  if (!logo) {
    Debug.error("[BgImageScroll] #home-image not found");
  }

  Debug.log("[BgImageScroll] Elements found:", {
    bgImage,
    extraContentSection,
    logo: logo.src,
  });

  // Wait for the visible logo image to fully load
  await waitForImageLoad(logo);

  // Use requestAnimationFrame to ensure layout is settled
  requestAnimationFrame(() => {
    const sectionContainer = document.body;
    const containerRect = sectionContainer.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();

    // Calculate relative Y position (cross-browser consistent)
    const relativeY = logoRect.top - containerRect.top + logoRect.height;

    Debug.log(
      `[BgImageScroll] Logo dimensions: ${logoRect.width}x${logoRect.height}`
    );
    Debug.log(`[BgImageScroll] relativeY: ${relativeY}px`);

    // Proceed with GSAP animation setup
    const offset = 20;

    gsap.set(bgImage, {
      y: relativeY + offset,
    });

    // Add the ready class to show the image
    bgImage.classList.add("ready");
    // Create scroll-triggered animation
    const scrollAnimation = gsap.timeline({
      scrollTrigger: {
        // Add an ID for easier reference
        id: "bgImageScroll",
        trigger: extraContentSection,
        start: scrollSettings.start,
        end: scrollSettings.end,
        scrub: 1, // Smooth scrubbing tied to scroll position
        pin: false,
        anticipatePin: 0,
        invalidateOnRefresh: true,

        // Handle resize events to update breakpoint settings
        onRefresh: () => {
          Debug.log(
            "[BgImageScroll] ScrollTrigger refreshed for new breakpoint"
          );
          const newSettings = getBreakpointScrollSettings();
          const scrollTriggerInstance = ScrollTrigger.getById("bgImageScroll");

          if (
            scrollTriggerInstance &&
            scrollTriggerInstance.vars.scrollTrigger
          ) {
            scrollTriggerInstance.vars.scrollTrigger.start = newSettings.start;
            scrollTriggerInstance.vars.scrollTrigger.end = newSettings.end;
            // Force ScrollTrigger to recalculate with new values
            scrollTriggerInstance.refresh();
          }
        },
        onEnter: () => {
          Debug.log("[BgImageScroll] Section entered viewport");
        },
        onLeave: () => {
          Debug.log("[BgImageScroll] Section left viewport");
        },
        onEnterBack: () => {
          Debug.log(
            "[BgImageScroll] Section re-entered viewport (scrolling up)"
          );
        },
        onLeaveBack: () => {
          Debug.log("[BgImageScroll] Section left viewport (scrolling up)");
        },
        onUpdate: (self) => {
          Debug.log(
            `[BgImageScroll] Progress: ${self.progress.toFixed(3)}, Direction: ${self.direction}`
          );
        },
      },
    });

    // Add animations to timeline
    scrollAnimation
      // Fade in and slide up content
      .to(bgImage, {
        y: -600,
        ease: "power2.out",
      });

    Debug.log("[BgImageScroll] Scroll animation created");

    // Store reference globally for debugging
    window.extraContentScrollAnimation = scrollAnimation;

    return scrollAnimation;
  });
}

/**
 * Initialize extra content scroll animations when DOM is ready
 */
function initBgImageScrollOnReady() {
  Debug.log("[BgImageScroll] Checking DOM ready state");

  if (document.readyState === "loading") {
    Debug.log("[BgImageScroll] DOM still loading, waiting...");
    document.addEventListener("DOMContentLoaded", initBgImageScroll);
  } else {
    Debug.log("[BgImageScroll] DOM ready, initializing immediately");
    initBgImageScroll();
  }
}

// Auto-initialize when script loads
initBgImageScrollOnReady();

;
/**
 * Home page specific functionality
 * Orchestrates all home page components and interactions
 */

/**
 * Initialize all home page functionality
 */
function initHomePage() {
  Debug.log("[Home]", "Initializing home page functionality");

  // Populate dynamic background images if image data is available
  if (window.KAUKA_CONFIG && window.KAUKA_CONFIG.componenteUno) {
    Debug.log("[Home]", "Populating dynamic background images");

    if (typeof getRandomImage === "function") {
      getRandomImage(window.KAUKA_CONFIG.componenteUno, "section-img-one");
      getRandomImage(window.KAUKA_CONFIG.componenteDos, "section-img-two");
      getRandomImage(window.KAUKA_CONFIG.componenteTres, "section-img-three");
      Debug.log("[Home]", "Dynamic images populated");
    } else {
      Debug.warn("[Home]", "getRandomImage function not available");
    }
  } else {
    Debug.warn("[Home]", "Image configuration not available in KAUKA_CONFIG");
  }

  // Initialize bg scroll
  if (typeof initBgImageScrollOnReady === "function") {
    initBgImageScrollOnReady();
  } else {
    Debug.warn("[HOME]", "initBgImageOnReady function not available");
  }
  // Initialize horizontal scroll
  // if (typeof initHomeHorizontalScroll === "function") {
  //   initHomeHorizontalScroll("#home-componentes", "#componentes-container");
  // } else {
  //   console.warn("[Home] initHomeHorizontalScroll function not available");
  // }

  // Get base URL from global config if available
  const baseURL = window.KAUKA_CONFIG ? window.KAUKA_CONFIG.baseURL : "";

  // Load and display artists
  // if (typeof fetchArtists === "function") {
  //   fetchArtists(baseURL)
  //     .then((artists) => {
  //       if (artists && artists.length > 0) {
  //         console.log(`[Home] Loaded ${artists.length} artists`);

  //         // Display first artist as gallery
  //         if (typeof renderArtistGallery === "function") {
  //           renderArtistGallery(artists[0], "home-artistas-galeria");
  //         } else {
  //           console.warn("[Home] renderArtistGallery function not available");
  //         }

  //         // Store artists globally for other components
  //         window.kaukaArtists = artists;
  //       } else {
  //         console.warn("[Home] No artists loaded");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("[Home] Error loading artists:", error);
  //     });
  // } else {
  //   console.warn("[Home] fetchArtists function not available");
  // }

  // Position background images
  // if (typeof positionSectionBackground === "function") {
  //   positionSectionBackground();

  //   Debug.log("[Home]", "Background positioning initialized");
  // } else {
  //   Debug.warn("[Home]", "positionSectionBackground function not available");
  // }

  // Initialize project showcase
  // if (typeof initProjectShowcase === "function") {
  //   initProjectShowcase();
  // } else {
  //   Debug.warn("[Home]", "initProjectShowcase function not available");
  // }

  Debug.log("[Home]", "Home page initialization complete");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomePage);
} else {
  initHomePage();
}
