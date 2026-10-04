const SUPABASE_URL =
  "https://oktndxyfucqibnjrnepa.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_NZGtnaEy9a2AD71b6VMqKg_78PHPEck";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

let currentFilter = "all";
let bookings = [];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {

  if (!dateStr) return "No date";

  const date = new Date(dateStr);

  if (isNaN(date)) return dateStr;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function statusText(status) {

  return {
    new: "New",
    upcoming: "Upcoming",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    "call-only": "Call-only"
  }[status] || "New";
}

function statusClass(status) {

  return `status-${status}`;
}

function getIcon(status) {

  return {
    new: "✨",
    upcoming: "⏳",
    active: "🚗",
    completed: "✅",
    cancelled: "❌",
    "call-only": "📞"
  }[status] || "✨";
}


/* ------------------------------
   LOAD BOOKINGS
-------------------------------- */

async function loadBookings() {

  const tripList =
    document.getElementById("tripList");

  if (!tripList) return;

  tripList.innerHTML =
    '<div class="empty-state">Loading trips...</div>';

  const {
    data,
    error
  } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("travel_date", {
      ascending: true
    })
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(error);

    tripList.innerHTML =
      '<div class="empty-state">Unable to load trips.</div>';

    return;
  }

  bookings = data || [];

  renderDashboard();
}


/* ------------------------------
   RENDER
-------------------------------- */

function renderDashboard() {

  const tripList =
    document.getElementById("tripList");

  const search =
    document.getElementById("rideSearch");

  if (!tripList) return;

  const query =
    (search?.value || "")
      .trim()
      .toLowerCase();

  let trips = [...bookings];

  if (currentFilter === "today") {

    trips = trips.filter(
      trip => trip.travel_date === getToday()
    );
  }

  if (currentFilter === "upcoming") {

    trips = trips.filter(
      trip =>
        trip.status === "upcoming" ||
        trip.status === "new"
    );
  }

  if (currentFilter === "completed") {

    trips = trips.filter(
      trip => trip.status === "completed"
    );
  }

  if (currentFilter === "calls") {

    trips = trips.filter(
      trip => trip.status === "call-only"
    );
  }

  if (query) {

    trips = trips.filter(trip => {

      return `
        ${trip.name}
        ${trip.pickup}
        ${trip.destination}
        ${trip.phone}
      `
      .toLowerCase()
      .includes(query);

    });
  }

  tripList.innerHTML =
    trips.length

      ? trips.map(trip => `

        <article class="trip-card">

          <div class="trip-card-main">

            <span class="trip-customer">
              ${escapeHtml(trip.name)}
            </span>

            <span class="trip-route">
              ${escapeHtml(trip.pickup)}
              →
              ${escapeHtml(trip.destination)}
            </span>

          </div>


          <div class="trip-info">

            <div>

              <div class="trip-date">
                ${formatDate(trip.travel_date)}
              </div>

              <div class="trip-meta">
                ${escapeHtml(trip.car_type || "")}
                •
                ${escapeHtml(trip.phone)}
              </div>

            </div>

            <span
              class="status-badge ${statusClass(trip.status)}"
            >
              ${getIcon(trip.status)}
              ${statusText(trip.status)}
            </span>

          </div>


          <div class="trip-actions">

            <button
              class="small-btn primary"
              type="button"
              data-action="status"
              data-status="upcoming"
              data-id="${trip.id}"
            >
              Upcoming
            </button>

            <button
              class="small-btn"
              type="button"
              data-action="status"
              data-status="active"
              data-id="${trip.id}"
            >
              Active
            </button>

            <button
              class="small-btn"
              type="button"
              data-action="status"
              data-status="completed"
              data-id="${trip.id}"
            >
              Done
            </button>

            <button
              class="small-btn"
              type="button"
              data-action="call"
              data-id="${trip.id}"
            >
              Call
            </button>

          </div>

        </article>

      `).join("")

      : '<div class="empty-state">No rides found.</div>';


  document.getElementById("totalRides").textContent =
    bookings.length;

  document.getElementById("todayCount").textContent =
    bookings.filter(
      trip => trip.travel_date === getToday()
    ).length;

  document.getElementById("activeCount").textContent =
    bookings.filter(
      trip => trip.status === "active"
    ).length;

  document.getElementById("callsCount").textContent =
    bookings.filter(
      trip => trip.status === "call-only"
    ).length;
}


/* ------------------------------
   UPDATE STATUS
-------------------------------- */

async function updateTripStatus(
  tripId,
  nextStatus
) {

  const {
    error
  } = await supabaseClient
    .from("bookings")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", tripId);

  if (error) {

    console.error(error);

    showToast("Unable to update trip.");

    return;
  }

  const trip =
    bookings.find(
      item => item.id === tripId
    );

  if (trip) {
    trip.status = nextStatus;
  }

  renderDashboard();

  showToast("Trip updated");
}


/* ------------------------------
   CALL CUSTOMER
-------------------------------- */

function callCustomer(tripId) {

  const trip =
    bookings.find(
      item => item.id === tripId
    );

  if (!trip) return;

  window.location.href =
    `tel:${trip.phone}`;
}


/* ------------------------------
   LOGOUT
-------------------------------- */

async function logout() {

  await supabaseClient.auth.signOut();

  sessionStorage.removeItem(
    "sn_driver_name"
  );

  sessionStorage.removeItem(
    "sn_driver_id"
  );

  window.location.href =
    "dashboard-login.html";
}


/* ------------------------------
   SECURITY CHECK
-------------------------------- */

async function checkDriverSession() {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();

  if (!session) {

    window.location.replace(
      "dashboard-login.html"
    );

    return false;
  }

  const {
    data: driver,
    error
  } = await supabaseClient
    .from("drivers")
    .select(
      "id, name, driver_id, is_active"
    )
    .eq(
      "auth_user_id",
      session.user.id
    )
    .single();

  if (
    error ||
    !driver ||
    !driver.is_active
  ) {

    await supabaseClient.auth.signOut();

    window.location.replace(
      "dashboard-login.html"
    );

    return false;
  }

  const driverName =
    document.getElementById("driverName");

  if (driverName) {
    driverName.textContent =
      driver.name;
  }

  return true;
}


/* ------------------------------
   TOAST
-------------------------------- */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    showToast.timeoutId
  );

  showToast.timeoutId =
    setTimeout(
      () => toast.classList.remove("show"),
      2200
    );
}


/* ------------------------------
   EVENTS
-------------------------------- */

function bindDashboardEvents() {

  const logoutButton =
    document.getElementById(
      "logoutButton"
    );

  const rideSearch =
    document.getElementById(
      "rideSearch"
    );

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logout
    );
  }

  if (rideSearch) {

    rideSearch.addEventListener(
      "input",
      renderDashboard
    );
  }

  document
    .querySelectorAll("[data-filter]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentFilter =
            button.dataset.filter;

          document
            .querySelectorAll(
              "[data-filter]"
            )
            .forEach(item => {

              item.classList.toggle(
                "active",
                item === button
              );

            });

          renderDashboard();
        }
      );

    });


  document.addEventListener(
    "click",
    event => {

      const actionBtn =
        event.target.closest(
          "[data-action]"
        );

      if (!actionBtn) return;

      const tripId =
        actionBtn.dataset.id;

      const action =
        actionBtn.dataset.action;


      if (action === "status") {

        updateTripStatus(
          tripId,
          actionBtn.dataset.status
        );
      }


      if (action === "call") {

        callCustomer(tripId);
      }

    }
  );
}


/* ------------------------------
   HTML ESCAPE
-------------------------------- */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ------------------------------
   START
-------------------------------- */

(async function () {

  if (
    !window.location.pathname.endsWith(
      "dashboard.html"
    )
  ) {
    return;
  }

  const authenticated =
    await checkDriverSession();

  if (!authenticated) return;

  bindDashboardEvents();

  await loadBookings();

})();