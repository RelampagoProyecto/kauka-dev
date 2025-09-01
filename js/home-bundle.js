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

    console.log("[BackgroundPositioner] Home image dimensions:", {
      rect: homeImgRect,
      scrollY: window.scrollY,
      calculatedBottom: homeImgBottom,
    });

    // Set the top position of the section background image
    sectionBgImg.style.top = `${homeImgBottom}px`;

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
  if (isImageLoaded(visibleImg)) {
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
 * Project showcase component for rendering programa-curatorial events
 */

/**
 * Render an event in the home project section
 * @param {Object} event - Event object with title, dates, location, etc.
 */
function renderEvent(event) {
  const container = document.getElementById("home-project-container");
  if (!container) {
    console.error("Home project container not found");
    return;
  }

  container.innerHTML = `
    <div
      id="home-project-inicio"
      class="event-date home-project-date">
      ${event.inicio ? `${event.inicio.dia}/${event.inicio.mes}/${event.inicio.año}` : ""}
    </div>
    <div
      id="home-project-titulo"
      class="event-title">
      ${event.title}
    </div>
    <div id="home-project-lugar" class="event-location event-info-base">
      ${event.lugar ? `<div class="event-label">Sede/lugar</div>` : ""}
      ${event.lugar ? `${event.lugar.nombre}<br />${event.lugar.direccion}` : ""}
    </div>
    <div id="home-project-hora" class="event-time event-info-base">
      ${event.hora ? `<div class="event-label">Hora:</div>` : ""}
      ${event.hora || ""}
    </div>
    <div
      id="home-project-notas"
      class="event-notes event-label">
       <span class="font-kauka">e</span> ${event.notas || ""}
    </div>
  `;

  // Set up click handler for the entire home-project section
  initializeProjectClickHandler(event.url);
}

/**
 * Initialize click handler for home project section
 * @param {string} eventUrl - URL to navigate to when project is clicked
 */
function initializeProjectClickHandler(eventUrl) {
  const homeProject = document.getElementById("home-project");

  if (!homeProject || !eventUrl) {
    if (window.KAUKA_DEBUG)
      console.log("Home project element or event URL not found");
    return;
  }

  // Add cursor pointer to indicate clickability
  homeProject.style.cursor = "pointer";

  // Add click event listener (don't clone, just add the listener)
  homeProject.addEventListener("click", function (e) {
    // Prevent default behavior
    e.preventDefault();

    if (window.KAUKA_DEBUG)
      console.log("Home project clicked, navigating to:", eventUrl);

    // Navigate to event URL
    window.location.href = eventUrl;
  });

  if (window.KAUKA_DEBUG)
    console.log("Project click handler initialized for URL:", eventUrl);
}

/**
 * Initialize home project diamond hover effect
 * Shows/hides the diamond overlay on mouse enter/leave
 */
function initializeProjectDiamondHover() {
  const homeProject = document.getElementById("home-project");
  const projectDiamond = document.getElementById("home-project-diamond");

  if (!homeProject || !projectDiamond) {
    if (window.KAUKA_DEBUG)
      console.log("Home project or diamond element not found");
    return;
  }

  // Ensure diamond starts hidden (opacity should be 0 by default from CSS)
  projectDiamond.classList.remove("show");

  if (window.KAUKA_DEBUG)
    console.log("Diamond initialized as hidden (opacity: 0)");

  homeProject.addEventListener("mouseenter", function () {
    projectDiamond.classList.add("show");
    if (window.KAUKA_DEBUG) console.log("Diamond shown on hover (opacity: 1)");
  });

  homeProject.addEventListener("mouseleave", function () {
    projectDiamond.classList.remove("show");
    if (window.KAUKA_DEBUG)
      console.log("Diamond hidden on mouse leave (opacity: 0)");
  });

  // Mobile touch support
  homeProject.addEventListener("touchstart", () => {
    projectDiamond.classList.add("show");
    if (window.KAUKA_DEBUG) console.log("Diamond shown on touch (opacity: 1)");
  });

  homeProject.addEventListener("touchend", () => {
    projectDiamond.classList.remove("show");
    if (window.KAUKA_DEBUG)
      console.log("Diamond hidden on touch end (opacity: 0)");
  });

  homeProject.addEventListener("touchcancel", () => {
    projectDiamond.classList.remove("show");
    if (window.KAUKA_DEBUG)
      console.log("Diamond hidden on touch cancel (opacity: 0)");
  });

  if (window.KAUKA_DEBUG)
    console.log("Diamond hover effect initialized with opacity transitions");
}

/**
 * Initialize project showcase functionality
 * Loads programa-curatorial data and sets up project display
 */
function initProjectShowcase() {
  console.log("[ProjectShowcase] Initializing project showcase");

  // Initialize diamond hover effect immediately
  initializeProjectDiamondHover();

  // Check if fetchProgramaCuratorial function is available
  if (typeof fetchProgramaCuratorial !== "function") {
    console.warn(
      "[ProjectShowcase] fetchProgramaCuratorial function not available"
    );
    return;
  }

  // Get base URL from global config if available
  const baseURL = window.KAUKA_CONFIG ? window.KAUKA_CONFIG.baseURL : "";

  // Fetch and display programa-curatorial data
  fetchProgramaCuratorial(baseURL)
    .then((events) => {
      if (events && events.length > 0) {
        console.log(
          `[ProjectShowcase] Loaded ${events.length} programa-curatorial events`
        );

        // Render the first event
        renderEvent(events[0]);

        // Store events globally for other components
        window.kaukaProgramaCuratorial = events;

        console.log(
          "[ProjectShowcase] Project showcase initialization complete"
        );
      } else {
        console.warn("[ProjectShowcase] No programa-curatorial events loaded");
      }
    })
    .catch((error) => {
      console.error(
        "[ProjectShowcase] Error loading programa-curatorial:",
        error
      );
    });
}

;
/**
 * Artist gallery component with slideshow functionality
 */

/**
 * Render artist gallery as a slideshow
 * @param {Object} artist - Artist object with images array
 * @param {string} containerId - ID of the container element
 * @param {number} maxImages - Maximum number of images to display (default: 6)
 */
function renderArtistGallery(artist, containerId, maxImages = 6) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  const imagesToShow = artist.imagenes.slice(0, maxImages);

  // Create slideshow HTML structure
  container.innerHTML = `
    <div class="artist-slideshow relative overflow-hidden bg-dark-brown">
      <!-- Slideshow container -->
      <div class="slideshow-track flex transition-transform duration-500 ease-in-out h-full" style="width: ${imagesToShow.length * 100}%">
        ${imagesToShow
          .map(
            (imagen) => `
          <div class="slide w-full h-full flex justify-center">
            <img
              src="${getResponsiveImageUrl(imagen)}"
              alt="${imagen.name}"
              class="max-w-full max-h-full object-contain cursor-pointer"
              onclick="window.location.href='${artist.url}'"
            />
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Navigation arrows overlay -->
      <div class="slideshow-arrows pointer-events-none absolute inset-0 flex items-end justify-between px-4 pb-10 z-[50]">
        <div class="slideshow-prev text-white w-10 h-10 flex items-center justify-center cursor-pointer z-[51]" style="pointer-events: auto !important; ${imagesToShow.length <= 1 ? "display:none;" : ""}">
          <svg class="w-10 h-10" viewBox="0 0 33.41 35.51">
            <path fill='#75c75f' d="M33.41,0v7.01s-23.45,10.74-23.45,10.74l23.45,10.74v7.01S0,20.11,0,20.11v-4.72S33.41,0,33.41,0Z"/>
          </svg>
        </div>
        <div class="slideshow-next text-white w-10 h-10 flex items-center justify-center cursor-pointer z-[51]" style="pointer-events: auto !important; ${imagesToShow.length <= 1 ? "display:none;" : ""}">
          <svg class="w-10 h-10" viewBox="0 0 33.41 35.51">
            <path fill="#75c75f" d="M33.41,15.39v4.72L0,35.51v-7.01l23.45-10.74L0,7.01V0l33.41,15.39Z"/>
          </svg>
        </div>
      </div>
    </div>
  `;

  // Initialize slideshow functionality
  initializeSlideshow(container, imagesToShow.length);
}

/**
 * Initialize slideshow functionality with GSAP animations
 * @param {HTMLElement} container - The slideshow container
 * @param {number} totalSlides - Total number of slides
 */
function initializeSlideshow(container, totalSlides) {
  // Robust debugging: log function call and DOM state
  if (window.KAUKA_DEBUG)
    console.log("[Slideshow] initializeSlideshow called", {
      container,
      totalSlides,
    });

  if (totalSlides <= 1) {
    if (window.KAUKA_DEBUG)
      console.log("[Slideshow] Only one slide, skipping slideshow logic");
    return;
  }

  const track = container.querySelector(".slideshow-track");
  const prevBtn = container.querySelector(".slideshow-prev");
  const nextBtn = container.querySelector(".slideshow-next");

  if (window.KAUKA_DEBUG) {
    console.log("[Slideshow] DOM state:", {
      trackExists: !!track,
      prevBtnExists: !!prevBtn,
      nextBtnExists: !!nextBtn,
      arrowsVisible:
        prevBtn &&
        nextBtn &&
        prevBtn.offsetParent !== null &&
        nextBtn.offsetParent !== null,
    });
  }

  let currentSlide = 0;

  // Go to specific slide
  function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    const translateX = -slideIndex * (100 / totalSlides);

    // Use GSAP for smooth animation if available, otherwise fallback to CSS
    if (window.gsap) {
      gsap.to(track, {
        x: `${translateX}%`,
        duration: 0.1,
        ease: "circle.out",
      });
    } else {
      track.style.transform = `translateX(${translateX}%)`;
    }
  }

  // Navigation functions
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(currentSlide);
  }

  // Event listeners with comprehensive debugging
  if (nextBtn) {
    // Test if element can receive pointer events
    const nextBtnStyles = window.getComputedStyle(nextBtn);
    if (window.KAUKA_DEBUG) {
      console.log("[Slideshow] Next button computed styles:", {
        pointerEvents: nextBtnStyles.pointerEvents,
        zIndex: nextBtnStyles.zIndex,
        display: nextBtnStyles.display,
        visibility: nextBtnStyles.visibility,
        opacity: nextBtnStyles.opacity,
        position: nextBtnStyles.position,
      });
    }

    // Add both click and mousedown listeners for testing
    nextBtn.addEventListener("click", function (e) {
      if (window.KAUKA_DEBUG) console.log("[Slideshow] Next arrow CLICKED", e);
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
    });
    nextBtn.addEventListener("mousedown", function (e) {
      if (window.KAUKA_DEBUG)
        console.log("[Slideshow] Next arrow MOUSEDOWN", e);
    });
    nextBtn.addEventListener("mouseenter", function (e) {
      if (window.KAUKA_DEBUG)
        console.log("[Slideshow] Next arrow MOUSEENTER", e);
    });
    if (window.KAUKA_DEBUG)
      console.log("[Slideshow] Next arrow event listeners attached");
  } else {
    if (window.KAUKA_DEBUG) console.warn("[Slideshow] Next arrow not found");
  }

  if (prevBtn) {
    // Test if element can receive pointer events
    const prevBtnStyles = window.getComputedStyle(prevBtn);
    if (window.KAUKA_DEBUG) {
      console.log("[Slideshow] Prev button computed styles:", {
        pointerEvents: prevBtnStyles.pointerEvents,
        zIndex: prevBtnStyles.zIndex,
        display: prevBtnStyles.display,
        visibility: prevBtnStyles.visibility,
        opacity: prevBtnStyles.opacity,
        position: prevBtnStyles.position,
      });
    }

    // Add both click and mousedown listeners for testing
    prevBtn.addEventListener("click", function (e) {
      if (window.KAUKA_DEBUG) console.log("[Slideshow] Prev arrow CLICKED", e);
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    });
    prevBtn.addEventListener("mousedown", function (e) {
      if (window.KAUKA_DEBUG)
        console.log("[Slideshow] Prev arrow MOUSEDOWN", e);
    });
    prevBtn.addEventListener("mouseenter", function (e) {
      if (window.KAUKA_DEBUG)
        console.log("[Slideshow] Prev arrow MOUSEENTER", e);
    });
    if (window.KAUKA_DEBUG)
      console.log("[Slideshow] Prev arrow event listeners attached");
  } else {
    if (window.KAUKA_DEBUG) console.warn("[Slideshow] Prev arrow not found");
  }

  // Test what element is actually receiving clicks at arrow positions
  setTimeout(() => {
    if (nextBtn && prevBtn) {
      const nextRect = nextBtn.getBoundingClientRect();
      const prevRect = prevBtn.getBoundingClientRect();

      const elementAtNextPos = document.elementFromPoint(
        nextRect.left + nextRect.width / 2,
        nextRect.top + nextRect.height / 2
      );
      const elementAtPrevPos = document.elementFromPoint(
        prevRect.left + prevRect.width / 2,
        prevRect.top + prevRect.height / 2
      );

      if (window.KAUKA_DEBUG) {
        console.log("[Slideshow] Element receiving clicks:", {
          nextArrowPos: elementAtNextPos,
          prevArrowPos: elementAtPrevPos,
          nextIsArrow:
            elementAtNextPos === nextBtn || nextBtn.contains(elementAtNextPos),
          prevIsArrow:
            elementAtPrevPos === prevBtn || prevBtn.contains(elementAtPrevPos),
        });
      }
    }
  }, 100);

  // Auto-advance every 4 seconds (commented out for now)
  // setInterval(nextSlide, 4000);
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
  console.log("[HorizontalScroll] Initializing for selector:", selector);
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
  const homeContainer = document.querySelector(selector);
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
function initHomeHorizontalScroll() {
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
      horizontalScroll = initHorizontalScroll(
        "#home-componentes",
        "#componentes-container",
        {
          onUpdate: (self) => {
            // Custom update logic for home page if needed
            console.log(
              `[HomeHorizontalScroll] Progress: ${self.progress.toFixed(3)}`
            );
          },
        }
      );

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
  if (typeof initHomeHorizontalScroll === "function") {
    initHomeHorizontalScroll();
  } else {
    console.warn("[Home] initHomeHorizontalScroll function not available");
  }

  // Get base URL from global config if available
  const baseURL = window.KAUKA_CONFIG ? window.KAUKA_CONFIG.baseURL : "";

  // Load and display artists
  if (typeof fetchArtists === "function") {
    fetchArtists(baseURL)
      .then((artists) => {
        if (artists && artists.length > 0) {
          console.log(`[Home] Loaded ${artists.length} artists`);

          // Display first artist as gallery
          if (typeof renderArtistGallery === "function") {
            renderArtistGallery(artists[0], "home-artistas-galeria");
          } else {
            console.warn("[Home] renderArtistGallery function not available");
          }

          // Store artists globally for other components
          window.kaukaArtists = artists;
        } else {
          console.warn("[Home] No artists loaded");
        }
      })
      .catch((error) => {
        console.error("[Home] Error loading artists:", error);
      });
  } else {
    console.warn("[Home] fetchArtists function not available");
  }

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
  if (typeof initProjectShowcase === "function") {
    initProjectShowcase();
  } else {
    console.warn("[Home] initProjectShowcase function not available");
  }

  console.log("[Home] Home page initialization complete");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomePage);
} else {
  initHomePage();
}
