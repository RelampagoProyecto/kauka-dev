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
      if (window.KAUKA_DEBUG) console.log("Programa Curatorial data:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching programa-curatorial data:", error);
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
      if (window.KAUKA_DEBUG)
        console.log(`Found ${data.length} artists with image galleries`);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching artists data:", error);
      return [];
    });
}

;
/**
 * Background positioning component for section backgrounds
 */

/**
 * Position section background image based on home image bottom
 * Calculates the bottom position of #home-img and sets it as top position for #section-bg-img
 * Waits for the visible image to fully load before calculating position
 */
function positionSectionBackground() {
  console.log("[BackgroundPositioner] Starting position calculation");

  const homeImg = document.getElementById("home-img");
  const sectionBgImg = document.getElementById("section-bg-img");

  if (!homeImg || !sectionBgImg) {
    console.warn("[BackgroundPositioner] Elements not found:", {
      homeImg: !!homeImg,
      sectionBgImg: !!sectionBgImg,
    });
    return;
  }

  console.log("[BackgroundPositioner] Found elements:", {
    homeImg,
    sectionBgImg,
  });

  // Function to calculate and set position
  function calculatePosition() {
    console.log("[BackgroundPositioner] Calculating position...");

    const homeImgRect = homeImg.getBoundingClientRect();
    const homeImgBottom = homeImgRect.bottom + window.scrollY;
    const spacer = 12;

    console.log("[BackgroundPositioner] Home image dimensions:", {
      rect: homeImgRect,
      scrollY: window.scrollY,
      calculatedBottom: homeImgBottom,
    });

    // Set the top position of the section background image
    sectionBgImg.style.top = `${homeImgBottom + spacer}px`;

    // Show the background image with smooth fade-in
    sectionBgImg.style.opacity = "1";

    console.log(
      `[BackgroundPositioner] Section background positioned at: ${homeImgBottom}px and made visible`
    );

    // Verify the styles were applied
    const computedStyle = window.getComputedStyle(sectionBgImg);
    console.log("[BackgroundPositioner] Applied styles:", {
      top: sectionBgImg.style.top,
      opacity: sectionBgImg.style.opacity,
      computedTop: computedStyle.top,
      computedOpacity: computedStyle.opacity,
    });
  }

  // Find the currently visible image (not hidden)
  const visibleImg = homeImg.querySelector("img:not(.hidden)");

  if (!visibleImg) {
    // No visible image found, calculate immediately
    console.log(
      "[BackgroundPositioner] No visible image found, calculating position immediately"
    );
    calculatePosition();
    return;
  }

  console.log(`[BackgroundPositioner] Found visible image: ${visibleImg.src}`);
  console.log("[BackgroundPositioner] Image details:", {
    complete: visibleImg.complete,
    naturalHeight: visibleImg.naturalHeight,
    naturalWidth: visibleImg.naturalWidth,
    src: visibleImg.src,
  });

  // Check if isImageLoaded function is available
  if (typeof isImageLoaded !== "function") {
    console.warn(
      "[BackgroundPositioner] isImageLoaded function not available, using fallback logic"
    );
    // Fallback: assume image is loaded if it's complete and has dimensions
    if (
      visibleImg.complete &&
      (visibleImg.naturalHeight > 0 || visibleImg.src.includes(".svg"))
    ) {
      console.log(
        "[BackgroundPositioner] Image appears loaded (fallback check), calculating position"
      );
      setTimeout(calculatePosition, 50);
    } else {
      console.log(
        "[BackgroundPositioner] Image not loaded (fallback check), waiting for load event"
      );
      const onLoad = function () {
        console.log("[BackgroundPositioner] Image load event fired");
        setTimeout(calculatePosition, 50);
        visibleImg.removeEventListener("load", onLoad);
        visibleImg.removeEventListener("error", onLoad);
      };

      visibleImg.addEventListener("load", onLoad);
      visibleImg.addEventListener("error", onLoad);
    }
    return;
  }

  // For SVG images, just calculate immediately since they load quickly
  // For other images, check if they're loaded
  if (visibleImg.src.includes(".svg") || isImageLoaded(visibleImg)) {
    console.log(
      "[BackgroundPositioner] Image ready (SVG or already loaded), calculating position immediately"
    );
    setTimeout(calculatePosition, 50);
  } else {
    console.log("[BackgroundPositioner] Waiting for image to load...");
    // Wait for the image to load
    const onLoad = function () {
      console.log(
        "[BackgroundPositioner] Visible image loaded, calculating position"
      );
      setTimeout(calculatePosition, 50);
      visibleImg.removeEventListener("load", onLoad);
      visibleImg.removeEventListener("error", onLoad);
    };

    visibleImg.addEventListener("load", onLoad);
    visibleImg.addEventListener("error", onLoad); // Handle errors too
  }
}

;
/**
 * Home page specific functionality
 * Orchestrates all home page components and interactions
 */

/**
 * Initialize all home page functionality
 */
function initHomePage() {
  console.log("[Home] Initializing home page functionality");

  // Set debug mode
  window.KAUKA_DEBUG = true;

  // Populate dynamic background images if image data is available
  if (window.KAUKA_CONFIG && window.KAUKA_CONFIG.componenteUno) {
    console.log("[Home] Populating dynamic background images");

    if (typeof getRandomImage === "function") {
      getRandomImage(window.KAUKA_CONFIG.componenteUno, "section-img-one");
      getRandomImage(window.KAUKA_CONFIG.componenteDos, "section-img-two");
      getRandomImage(window.KAUKA_CONFIG.componenteTres, "section-img-three");
      console.log("[Home] Dynamic images populated");
    } else {
      console.warn("[Home] getRandomImage function not available");
    }
  } else {
    console.warn("[Home] Image configuration not available in KAUKA_CONFIG");
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
  if (typeof positionSectionBackground === "function") {
    positionSectionBackground();

    // Handle window resize to reposition background image
    window.addEventListener("resize", function () {
      console.log("[Home] Window resized, repositioning background");
      positionSectionBackground();
    });

    console.log(
      "[Home] Background positioning initialized with resize handler"
    );
  } else {
    console.warn("[Home] positionSectionBackground function not available");
  }

  // Initialize project showcase
  // if (typeof initProjectShowcase === "function") {
  //   initProjectShowcase();
  // } else {
  //   console.warn("[Home] initProjectShowcase function not available");
  // }

  console.log("[Home] Home page initialization complete");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomePage);
} else {
  initHomePage();
}
