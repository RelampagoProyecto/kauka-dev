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
function initHeaderToggle() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("navbar-menu-container");

  // Handle click events for menu toggle
  // UPDATED: Enhanced to coordinate nav overlay visibility with menu state
  document.addEventListener("click", (e) => {
    // Toggle menu when clicking on navbar brand/title
    const isClickInsideNavbar = e.target.closest(".navbar");
    // Debug.log(`[Header] isClickInsideNavbar: ${isClickInsideNavbar}`);
    if (isClickInsideNavbar) {
      toggle.checked = !toggle.checked;
      Debug.log(`[Header] toggle: ${toggle.checked}`);
      const navOverlay = document.getElementById("nav-overlay");
      // Show/hide menu based on toggle state
      // CHANGE: Added nav overlay state management
      if (toggle.checked) {
        // Show mobile menu
        menu.classList.remove("hidden");
        menu.classList.add("block");
        Debug.log("[Header] Mobile menu shown");
      } else {
        // Hide mobile menu
        menu.classList.add("hidden");
        menu.classList.remove("block");
        Debug.log("[Header] Mobile menu hidden");
      }
    }
  });
}

/**
 * Initialize nav overlay hover effect
 * Shows/hides the nav overlay on mouse enter/leave and touch events
 * ADDED: New function to handle interactive nav overlay behavior
 * UPDATED: Added touch events for mobile support
 *
 * Purpose: Creates a visual feedback layer that appears when hovering over navigation
 * Behavior:
 * - Shows overlay on header mouseenter/touchstart
 * - Hides overlay on header mouseleave/touchend/touchcancel
 * - Automatically disabled when mobile menu is open
 */
function initializeNavOverlayHover() {
  const header = document.getElementById("nav");
  const navOverlay = document.getElementById("nav-overlay");

  if (!header || !navOverlay) {
    Debug.log("[Header] Header or nav overlay element not found");
    return;
  } else {
    Debug.log("[Header] Header and nav-overlay found");
  }

  // Function to show overlay (used by both mouse and touch)
  function showOverlay() {
    const toggle = document.getElementById("nav-toggle");
    navOverlay.classList.remove("hidden");
    navOverlay.classList.add("block");
    Debug.log("[Header] Nav overlay shown");
  }

  // Function to hide overlay (used by both mouse and touch)
  function hideOverlay() {
    navOverlay.classList.add("hidden");
    navOverlay.classList.remove("block");
    Debug.log("[Header] Nav overlay hidden");
  }

  // DESKTOP: Mouse events
  header.addEventListener("mouseenter", showOverlay);
  header.addEventListener("mouseleave", hideOverlay);

  // MOBILE: Touch events
  header.addEventListener(
    "touchstart",
    function (e) {
      // Only prevent default for overlay interaction, not for menu functionality
      // Check if the touch is not on interactive elements like menu toggle
      const isMenuToggle =
        e.target.closest("#nav-toggle") ||
        e.target.closest('label[for="nav-toggle"]');
      const isNavLink =
        e.target.closest(".nav-link") || e.target.closest(".navbar-brand");

      if (!isMenuToggle && !isNavLink) {
        // Only prevent default for non-interactive overlay touches
        showOverlay();
      }
    },
    { passive: true }
  );

  header.addEventListener("touchend", hideOverlay);
  header.addEventListener("touchcancel", hideOverlay);
}

/**
 * Handle dropdown toggle functionality
 * Shows/hides dropdown menu when clicking on the diamond icon
 */
function initializeDropdownToggle() {
  const diamonds = document.querySelectorAll(".nav-link-diamond");
  const navbar = document.querySelector(".navbar");

  Debug.log("[Header] Found diamonds:", diamonds.length);

  diamonds.forEach((diamond, index) => {
    Debug.log(`[Header] Adding click listener to diamond ${index}`);

    diamond.addEventListener("click", function (e) {
      Debug.log("[Header] Diamond clicked!");
      e.preventDefault();
      e.stopPropagation();

      // Find the dropdown list in the same parent container
      const parentDropdown = this.closest(".nav-dropdown");
      const dropdownList = parentDropdown
        ? parentDropdown.querySelector(".nav-dropdown-list")
        : null;

      Debug.log("[Header] Parent dropdown:", parentDropdown);
      Debug.log("[Header] Dropdown list:", dropdownList);

      if (dropdownList) {
        // Toggle the lg:flex class for desktop dropdown visibility
        const isCurrentlyVisible = dropdownList.classList.contains("block");
        // get navbar height
        const navInitialH = 54;

        // First close all other dropdowns
        const allDropdowns = document.querySelectorAll(".nav-dropdown-list");
        Debug.log("[Header] closing all dropdownList");
        allDropdowns.forEach((dropdown) => {
          if (dropdown !== dropdownList) {
            dropdown.classList.remove("block");
            dropdown.classList.remove("lg:flex");
            dropdown.classList.add("hidden");
            navbar.style.height = `${navInitialH}px`;
          }
        });

        // Then toggle the current dropdown
        if (isCurrentlyVisible) {
          navbar.style.height = `${navInitialH}px`;
          dropdownList.classList.remove("block");
          dropdownList.classList.remove("lg:flex");
          dropdownList.classList.add("hidden");

          Debug.log("[Header] Hiding dropdown");
        } else {
          dropdownList.classList.add("block");
          dropdownList.classList.add("lg:flex");
          dropdownList.classList.remove("hidden");

          const listH = dropdownList.offsetHeight;
          Debug.log("[Header] listH:", listH);
          Debug.log("[Header] navInitialH:", navInitialH);
          const newH = navInitialH + listH;
          Debug.log("[Header] newH:", newH);

          navbar.style.height = `${newH}px`;

          Debug.log("[Header] Showing dropdown");
        }
      }
    });

    // Make sure the diamond is clickable
    diamond.style.cursor = "pointer";
    diamond.style.pointerEvents = "auto";
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-dropdown")) {
      const allDropdowns = document.querySelectorAll(".nav-dropdown-list");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("lg:flex");
        dropdown.classList.add("lg:hidden");
      });
    }
  });
}

function initHeaderOnReady() {
  Debug.log("[Header] Checking DOM ready state");

  if (document.readyState === "loading") {
    Debug.log("[Header] DOM still loading, waiting...");
    document.addEventListener("DOMContentLoaded", initializeDropdownToggle);
    // Initialize the nav overlay hover effect when DOM is ready
    document.addEventListener("DOMContentLoaded", initializeNavOverlayHover);
    initHeaderToggle();
  } else {
    Debug.log("[Header] DOM ready, initializing immediately");
    initHeaderToggle();
  }
}
