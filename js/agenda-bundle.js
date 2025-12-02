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

      // Helper to capitalize first letter
      const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

      // Build the HTML template for the title
      let titleTemplate = "";
      if (isSameMonth) {
        titleTemplate = `
            <div class="agenda-days">${startDate.toFormat("d")} - ${endDate.toFormat("d")}</div>
            <div class="agenda-month">${startDate.toFormat("LLLL")}</div>`;
      } else {
        const startMonth = capitalize(startDate.toFormat("LLL"));
        const endMonth = capitalize(endDate.toFormat("LLL"));
        titleTemplate = `
            <div class="agenda-days">${startDate.toFormat("d")} ${startMonth} - ${endDate.toFormat("d")} ${endMonth}</div>`;
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
  // Debug logs for dependencies and versions
  console.log("[Agenda] Starting renderAgenda");
  console.log(
    "[Agenda] FullCalendar defined:",
    typeof FullCalendar !== "undefined"
  );
  if (typeof FullCalendar !== "undefined") {
    console.log("[Agenda] FullCalendar version:", FullCalendar.version);
  }
  console.log("[Agenda] Luxon defined:", typeof luxon !== "undefined");
  if (typeof luxon !== "undefined") {
    console.log("[Agenda] Luxon version:", luxon.VERSION);
  }
  console.log(
    "[Agenda] KAUKA_CONFIG events defined:",
    typeof window.KAUKA_CONFIG !== "undefined" &&
      typeof window.KAUKA_CONFIG.events !== "undefined"
  );

  if (typeof FullCalendar === "undefined" || typeof luxon === "undefined") {
    console.error("[Agenda] Critical dependencies missing. Aborting render.");
    return;
  }

  var calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
    console.error("[Agenda] Calendar element #calendar not found");
    return;
  }

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
      dayGridMonth: "mes",
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
