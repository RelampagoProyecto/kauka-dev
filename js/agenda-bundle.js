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
function updateTitle(element, context) {
  /**
   * Updates the FullCalendar view title with custom HTML using Luxon for date formatting.
   * Also moves the all-day section below time slots in timeGridDay view.
   *
   * @param {string} element - CSS selector for the calendar title element (e.g., '.fc-toolbar-title').
   * @param {Object} context - FullCalendar view context object, typically passed from viewDidMount or datesSet.
   * @param {Object} context.view - The current FullCalendar view instance.
   * @param {string} context.view.type - The type of the current view (e.g., 'listDay', 'dayGridMonth', 'timeGridDay').
   * @param {Date} context.view.currentStart - The start date of the current view.
   * @param {HTMLElement} [context.el] - The root element of the current view (used for DOM manipulation).
   */
  const titleEl = document.querySelector(element);
  Debug.log(`[Agenda] current view type: ${context.view.type}`);
  // If the title element exists, customize its content based on the current view
  if (titleEl) {
    // For the 'listDay' view, show a custom title with weekday, day, and month in Spanish
    if (context.view.type === "listWeek") {
      Debug.info(`[Agenda] current week start: ${context.view.currentStart}`);
      Debug.info(`[Agenda] current week end: ${context.view.currentEnd}`);
      const currentStart = context.view.currentStart; // Get the current date for the view
      const currentEnd = context.view.currentEnd; // Get the current date for the view
      const startDate = luxon.DateTime.fromJSDate(currentStart).setLocale("es"); // Format date with Luxon
      const endDate = luxon.DateTime.fromJSDate(currentEnd).setLocale("es"); // Format date with Luxon

      // Check if startDate and endDate month are the same
      const isSameMonth = startDate.hasSame(endDate, "month");
      Debug.info(`[Agenda] isSameMonth: ${isSameMonth}`);

      // Build the HTML template for the title
      let titleTemplate = "";
      if (isSameMonth) {
        titleTemplate = `
            <div class="agenda-days">${startDate.toFormat("d")} - ${endDate.toFormat("d")}</div>  
            <div class="agenda-month">${startDate.toFormat("LLLL")}</div>`;
      } else {
        titleTemplate = `
            <div class="agenda-days">${startDate.toFormat("d")} de ${startDate.toFormat("LLLL")} - ${endDate.toFormat("d")} de ${endDate.toFormat("LLLL")}</div>`;
      }
      const formattedTitle = titleTemplate;
      titleEl.innerHTML = formattedTitle; // Set the custom HTML as the title

      // expand column for day headers
      const ths = document.querySelectorAll(".fc-list-day th");
      if (ths) {
        ths.forEach((el) => {
          el.setAttribute("colspan", "4");
        });
      }
    }
    // For the 'dayGridMonth' view, show only the month name in Spanish
    if (context.view.type === "listMonth") {
      // Clear previous content before setting new title
      titleEl.innerHTML = "";
      const currentDate = context.view.currentStart; // Get the current date for the view
      const luxonDate = luxon.DateTime.fromJSDate(currentDate).setLocale("es"); // Format date with Luxon
      // Build the HTML template for the title
      const titleTemplate = `
            <div class="agenda-month">${luxonDate.toFormat("LLLL")}</div>`;
      const formattedTitle = titleTemplate;
      titleEl.innerHTML = formattedTitle; // Set the custom HTML as the title
    }
  }
}

function renderAgenda() {
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "listWeek",
    timeZone: "America/Bogota",
    locale: "es",
    headerToolbar: {
      left: "title,prev,next,listWeek,listMonth",
      center: "",
      right: "",
    },
    buttonText: {
      today: "hoy",
      month: "mes",
      week: "semana",
      day: "día",
      listMonth: "mes",
    },
    // Listday config
    listDayFormat: { weekday: "long", day: "numeric" },
    listDaySideFormat: "",
    // All-day events configuration for timeGridDay view
    allDaySlot: true,
    allDayText: "Todo el día",
    slotEventOverlap: true,
    datesSet: function (info) {
      Debug.info("[Agenda] datesSet call");
      updateTitle(".fc-toolbar-title", info);
    },
    // Move all-day section to bottom in timeGridDay
    viewDidMount: function (info) {
      Debug.info("[Agenda] viewDidMount call");
      //updateTitle(".fc-toolbar-title", info);
      document.querySelector(".agenda-container").classList.add("visible");
    },
    dateClick: function (info) {
      Debug.info("[Agenda] dateClick call");
      // Change to day list view and navigate to clicked date
      calendar.changeView("listDay", info.date);
    },
    // Add events from your Hugo content
    events: window.KAUKA_CONFIG.events,
    views: {
      listWeek: {
        eventTimeFormat: "hh:mm a",
      },
    },
  });
  calendar.render();
}

function initAgendaOnReady() {
  Debug.log("[Agenda] Checking DOM ready state");

  if (document.readyState === "loading") {
    Debug.log("[Agenda] DOM still loading, waiting...");
    document.addEventListener("DOMContentLoaded", renderAgenda);
  } else {
    Debug.log("[Agenda] DOM ready, initializing immediately");
    renderAgenda();
  }
}
