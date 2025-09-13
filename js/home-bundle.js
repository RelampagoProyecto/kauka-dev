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

  // Ensure DOM is ready
  if (document.readyState === "loading") {
    console.log(
      "[BackgroundPositioner] DOM not ready, waiting for DOMContentLoaded"
    );
    document.addEventListener("DOMContentLoaded", positionSectionBackground);
    return;
  }

  const homeImg = document.getElementById("home-img");
  const sectionBgImg = document.getElementById("section-bg-img");
  const extraContentSection = document.querySelector(
    ".home-extra-content-section"
  );

  if (!homeImg || !sectionBgImg) {
    console.warn("[BackgroundPositioner] Elements not found:", {
      homeImg: !!homeImg,
      sectionBgImg: !!sectionBgImg,
    });
    return;
  }

  if (!extraContentSection) {
    console.warn(
      "[BackgroundPositioner] Extra content section not found, falling back to simple behavior"
    );
  }

  console.log("[BackgroundPositioner] Found elements:", {
    homeImg,
    sectionBgImg,
    extraContentSection: !!extraContentSection,
  });

  // Store initial position and following state
  let initialPosition = null;
  let isFollowingScroll = false;

  // Visibility offset - start following this many pixels before section enters viewport
  const visibilityOffset = 380;

  // Function to calculate and set position
  function calculatePosition() {
    console.log("[BackgroundPositioner] Calculating position...");

    // Wait a bit longer for layout to stabilize
    setTimeout(() => {
      const homeImgRect = homeImg.getBoundingClientRect();
      const homeImgBottom = homeImgRect.bottom + window.scrollY;
      const spacer = 12;

      console.log("[BackgroundPositioner] Home image dimensions:", {
        rect: homeImgRect,
        scrollY: window.scrollY,
        calculatedBottom: homeImgBottom,
        homeImgOffsetTop: homeImg.offsetTop,
        homeImgOffsetHeight: homeImg.offsetHeight,
      });

      // Double-check by also using offset properties for better accuracy
      const alternativeBottom = homeImg.offsetTop + homeImg.offsetHeight;

      console.log("[BackgroundPositioner] Alternative calculation:", {
        alternativeBottom,
        difference: Math.abs(homeImgBottom - alternativeBottom),
      });

      // Use the more accurate calculation
      const finalBottom = Math.max(homeImgBottom, alternativeBottom);

      // Check if the background image is fixed positioned
      const bgComputedStyle = window.getComputedStyle(sectionBgImg);
      const isFixed = bgComputedStyle.position === "fixed";

      console.log("[BackgroundPositioner] Element positioning:", {
        position: bgComputedStyle.position,
        isFixed: isFixed,
      });

      // Calculate initial position and scroll threshold
      if (isFixed) {
        // For fixed positioning, calculate what the position would be if loaded from scroll position 0
        // We need the viewport position the home image would have at scroll 0
        const homeImgBottomAtScrollZero =
          homeImg.offsetTop + homeImg.offsetHeight - window.scrollY;
        initialPosition = homeImgBottomAtScrollZero + spacer;
        console.log(
          `[BackgroundPositioner] Fixed element initial position (corrected for scroll): ${initialPosition}px`
        );
      } else {
        // For absolute/relative positioning, use document coordinates (not affected by scroll)
        initialPosition = finalBottom + spacer;
        console.log(
          `[BackgroundPositioner] Absolute element initial position: ${initialPosition}px`
        );
      }

      // Set the initial position
      sectionBgImg.style.top = `${initialPosition}px`;

      // Check if we should already be following scroll on page load (e.g., page loaded from scrolled position)
      if (extraContentSection) {
        const extraContentRect = extraContentSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isExtraContentVisible =
          extraContentRect.top < viewportHeight + visibilityOffset &&
          extraContentRect.bottom > 0;

        if (isExtraContentVisible) {
          console.log(
            "[BackgroundPositioner] Extra content visible on load, starting to follow immediately"
          );
          isFollowingScroll = true;

          // Update position to follow extra content section
          if (isFixed) {
            const extraContentTopViewport = extraContentRect.top;
            const bgImageHeight =
              sectionBgImg.offsetHeight ||
              sectionBgImg.getBoundingClientRect().height;
            const topPosition = extraContentTopViewport - bgImageHeight;
            sectionBgImg.style.top = `${topPosition}px`;
            console.log(
              `[BackgroundPositioner] Initial position updated to follow (fixed): ${topPosition}px`
            );
          } else {
            const extraContentTopInDocument = extraContentSection.offsetTop;
            const bgImageHeight =
              sectionBgImg.offsetHeight ||
              sectionBgImg.getBoundingClientRect().height;
            const topPosition = extraContentTopInDocument - bgImageHeight;
            sectionBgImg.style.top = `${topPosition}px`;
            console.log(
              `[BackgroundPositioner] Initial position updated to follow (absolute): ${topPosition}px`
            );
          }
        }
      }

      // Show the background image with smooth fade-in
      sectionBgImg.style.opacity = "1";

      console.log(
        `[BackgroundPositioner] Section background positioned and made visible at: ${initialPosition}px`
      );

      // Verify the styles were applied
      const computedStyle = window.getComputedStyle(sectionBgImg);
      console.log("[BackgroundPositioner] Applied styles:", {
        top: sectionBgImg.style.top,
        opacity: sectionBgImg.style.opacity,
        computedTop: computedStyle.top,
        computedOpacity: computedStyle.opacity,
      });

      // Add resize handler to recalculate position on window resize
      // Remove any existing listener first
      if (window.backgroundPositionerResize) {
        window.removeEventListener("resize", window.backgroundPositionerResize);
      }

      window.backgroundPositionerResize = function () {
        console.log(
          "[BackgroundPositioner] Window resized, recalculating position"
        );
        // Recalculate with a small delay to let layout settle
        setTimeout(() => {
          // Check positioning type again as it might change with responsive styles
          const resizeComputedStyle = window.getComputedStyle(sectionBgImg);
          const isFixed = resizeComputedStyle.position === "fixed";

          // Recalculate initial position
          if (isFixed) {
            // For fixed positioning, calculate what the position would be if at scroll position 0
            const homeImgBottomAtScrollZero =
              homeImg.offsetTop + homeImg.offsetHeight - window.scrollY;
            initialPosition = homeImgBottomAtScrollZero + spacer;
          } else {
            const homeImgBottom = homeImg.offsetTop + homeImg.offsetHeight;
            initialPosition = homeImgBottom + spacer;
          }

          // Check if extra content section is visible and update position accordingly
          if (extraContentSection) {
            const extraContentRect =
              extraContentSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const isExtraContentVisible =
              extraContentRect.top < viewportHeight + visibilityOffset &&
              extraContentRect.bottom > 0;

            if (isExtraContentVisible) {
              // Extra content is visible - align with it
              if (isFixed) {
                const extraContentTopViewport = extraContentRect.top;
                const bgImageHeight =
                  sectionBgImg.offsetHeight ||
                  sectionBgImg.getBoundingClientRect().height;
                const topPosition = extraContentTopViewport - bgImageHeight;
                sectionBgImg.style.top = `${topPosition}px`;
                console.log(
                  `[BackgroundPositioner] Resize - following extra content (fixed): ${topPosition}px`
                );
              } else {
                const extraContentTopInDocument = extraContentSection.offsetTop;
                const bgImageHeight =
                  sectionBgImg.offsetHeight ||
                  sectionBgImg.getBoundingClientRect().height;
                const topPosition = extraContentTopInDocument - bgImageHeight;
                sectionBgImg.style.top = `${topPosition}px`;
                console.log(
                  `[BackgroundPositioner] Resize - following extra content (absolute): ${topPosition}px`
                );
              }
              isFollowingScroll = true;
            } else {
              // Extra content not visible - use initial position
              sectionBgImg.style.top = `${initialPosition}px`;
              isFollowingScroll = false;
              console.log(
                `[BackgroundPositioner] Resize - reset to initial position: ${initialPosition}px`
              );
            }
          } else {
            // No extra content section - use initial position
            sectionBgImg.style.top = `${initialPosition}px`;
            isFollowingScroll = false;
          }

          console.log("[BackgroundPositioner] Resize recalculation complete:", {
            initialPosition,
            isFollowingScroll,
          });
        }, 100);
      };

      window.addEventListener("resize", window.backgroundPositionerResize);

      // Add scroll handler to update position on scroll
      // Remove any existing scroll listener first
      if (window.backgroundPositionerScroll) {
        window.removeEventListener("scroll", window.backgroundPositionerScroll);
      }

      window.backgroundPositionerScroll = function () {
        // Use requestAnimationFrame for smooth scroll performance
        if (!window.backgroundPositionerScrollPending) {
          window.backgroundPositionerScrollPending = true;
          requestAnimationFrame(() => {
            if (extraContentSection) {
              // Check if extra content section is visible in viewport
              const extraContentRect =
                extraContentSection.getBoundingClientRect();
              const viewportHeight = window.innerHeight;

              // Section is visible if it's top edge is above the bottom of viewport (with offset)
              // and its bottom edge is below the top of viewport
              const isExtraContentVisible =
                extraContentRect.top < viewportHeight + visibilityOffset &&
                extraContentRect.bottom > 0;

              console.log("[BackgroundPositioner] Viewport visibility check:", {
                extraContentTop: extraContentRect.top,
                extraContentBottom: extraContentRect.bottom,
                viewportHeight,
                visibilityOffset,
                effectiveThreshold: viewportHeight + visibilityOffset,
                isVisible: isExtraContentVisible,
              });

              if (isExtraContentVisible) {
                // Extra content is visible - align bottom of bg image with top of extra content
                const scrollComputedStyle =
                  window.getComputedStyle(sectionBgImg);
                const isFixed = scrollComputedStyle.position === "fixed";

                if (isFixed) {
                  const extraContentTopViewport = extraContentRect.top;
                  const bgImageHeight =
                    sectionBgImg.offsetHeight ||
                    sectionBgImg.getBoundingClientRect().height;
                  const topPosition = extraContentTopViewport - bgImageHeight;

                  sectionBgImg.style.top = `${topPosition}px`;

                  console.log(
                    "[BackgroundPositioner] Following extra content (fixed):",
                    {
                      extraContentTopViewport,
                      bgImageHeight,
                      topPosition,
                    }
                  );
                } else {
                  const extraContentTopInDocument =
                    extraContentSection.offsetTop;
                  const bgImageHeight =
                    sectionBgImg.offsetHeight ||
                    sectionBgImg.getBoundingClientRect().height;
                  const topPosition = extraContentTopInDocument - bgImageHeight;

                  sectionBgImg.style.top = `${topPosition}px`;

                  console.log(
                    "[BackgroundPositioner] Following extra content (absolute):",
                    {
                      extraContentTopInDocument,
                      bgImageHeight,
                      topPosition,
                    }
                  );
                }

                if (!isFollowingScroll) {
                  isFollowingScroll = true;
                  console.log(
                    "[BackgroundPositioner] Started following - extra content is visible"
                  );
                }
              } else {
                // Extra content is not visible - keep initial position
                if (isFollowingScroll) {
                  sectionBgImg.style.top = `${initialPosition}px`;
                  isFollowingScroll = false;
                  console.log(
                    "[BackgroundPositioner] Stopped following - extra content not visible, reset to initial position:",
                    initialPosition
                  );
                }
              }
            }

            window.backgroundPositionerScrollPending = false;
          });
        }
      };

      window.addEventListener("scroll", window.backgroundPositionerScroll, {
        passive: true,
      });
    }, 100); // Increased delay for better stability
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
      // Use longer delay for SVGs in fallback mode too
      const delay = visibleImg.src.includes(".svg") ? 200 : 50;
      setTimeout(calculatePosition, delay);
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

  // For SVG images, wait a bit longer for layout to stabilize
  // For other images, check if they're loaded
  if (visibleImg.src.includes(".svg")) {
    console.log(
      "[BackgroundPositioner] SVG image found, waiting for layout stabilization"
    );
    // Use a longer timeout for SVGs to ensure the layout is stable
    setTimeout(calculatePosition, 200);
  } else if (isImageLoaded(visibleImg)) {
    console.log(
      "[BackgroundPositioner] Regular image already loaded, calculating position"
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

    console.log("[Home] Background positioning initialized");
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
