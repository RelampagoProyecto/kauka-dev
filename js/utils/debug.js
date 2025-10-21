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
