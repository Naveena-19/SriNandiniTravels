const TRIP_STORAGE_KEY = 'sn_driver_trips';
const LEGACY_DEMO_TRIP_IDS = new Set(['R-2041', 'R-2048', 'R-2050', 'R-2053', 'R-2057']);

let currentFilter = 'all';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getTrips() {
  const savedTrips = JSON.parse(localStorage.getItem(TRIP_STORAGE_KEY) || '[]');
  const trips = Array.isArray(savedTrips)
    ? savedTrips.filter((trip) => !LEGACY_DEMO_TRIP_IDS.has(trip.id))
    : [];
  if (trips.length !== savedTrips.length) {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trips));
  }
  return trips;
}

function saveTrips(trips) {
  const currentTrips = trips.filter((trip) => !LEGACY_DEMO_TRIP_IDS.has(trip.id));
  localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(currentTrips));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 2200);
}

function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  return isNaN(date) ? dateStr : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusText(status) {
  return {
    new: 'New',
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'call-only': 'Call-only'
  }[status] || 'Upcoming';
}

function statusClass(status) {
  return `status-${status}`;
}

function getIcon(status) {
  return {
    new: '✨',
    upcoming: '⏳',
    active: '🚗',
    completed: '✅',
    cancelled: '❌',
    'call-only': '📞'
  }[status] || '⏳';
}

function renderDashboard() {
  const tripList = document.getElementById('tripList');
  const rideSearch = document.getElementById('rideSearch');
  const totalRides = document.getElementById('totalRides');
  const todayCount = document.getElementById('todayCount');
  const activeCount = document.getElementById('activeCount');
  const callsCount = document.getElementById('callsCount');

  if (!tripList || !totalRides || !todayCount || !activeCount || !callsCount) return;

  const query = (rideSearch?.value || '').trim().toLowerCase();
  let trips = getTrips();

  if (currentFilter === 'today') {
    trips = trips.filter((trip) => trip.date === getToday());
  } else if (currentFilter === 'upcoming') {
    trips = trips.filter((trip) => trip.status === 'upcoming' || trip.status === 'new');
  } else if (currentFilter === 'completed') {
    trips = trips.filter((trip) => trip.status === 'completed');
  } else if (currentFilter === 'calls') {
    trips = trips.filter((trip) => trip.status === 'call-only');
  }

  if (query) {
    trips = trips.filter((trip) => {
      return `${trip.name} ${trip.pickup} ${trip.destination} ${trip.phone}`.toLowerCase().includes(query);
    });
  }

  trips.sort((a, b) => new Date(a.date) - new Date(b.date));

  tripList.innerHTML = trips.length
    ? trips.map((trip) => `
      <article class="trip-card">
        <div class="trip-card-main">
          <span class="trip-customer">${trip.name}</span>
          <span class="trip-route">${trip.pickup} → ${trip.destination}</span>
        </div>

        <div class="trip-info">
          <div>
            <div class="trip-date">${formatDate(trip.date)}</div>
            <div class="trip-meta">${trip.carType} • ${trip.phone}</div>
          </div>
          <span class="status-badge ${statusClass(trip.status)}">${getIcon(trip.status)} ${statusText(trip.status)}</span>
        </div>

        <div class="trip-actions">
          <button class="small-btn primary" type="button" data-action="status" data-status="upcoming" data-id="${trip.id}">Upcoming</button>
          <button class="small-btn" type="button" data-action="status" data-status="active" data-id="${trip.id}">Active</button>
          <button class="small-btn" type="button" data-action="status" data-status="completed" data-id="${trip.id}">Done</button>
          <button class="small-btn" type="button" data-action="call" data-id="${trip.id}">Call</button>
          <button class="small-btn danger" type="button" data-action="delete" data-id="${trip.id}" aria-label="Delete ride for ${trip.name}">Delete</button>
        </div>
      </article>
    `).join('')
    : '<div class="empty-state">No rides found for this view.</div>';

  totalRides.textContent = getTrips().length;
  todayCount.textContent = getTrips().filter((trip) => trip.date === getToday()).length;
  activeCount.textContent = getTrips().filter((trip) => trip.status === 'active').length;
  callsCount.textContent = getTrips().filter((trip) => trip.status === 'call-only').length;
}

function updateTripStatus(tripId, nextStatus) {
  const trips = getTrips();
  const updatedTrips = trips.map((trip) => {
    if (trip.id === tripId) {
      return { ...trip, status: nextStatus };
    }
    return trip;
  });
  saveTrips(updatedTrips);
  renderDashboard();
  showToast('Trip updated');
}

function deleteTrip(tripId) {
  const trips = getTrips();
  const updatedTrips = trips.filter((trip) => trip.id !== tripId);
  if (updatedTrips.length === trips.length) return;
  saveTrips(updatedTrips);
  if (document.getElementById('tripList')) renderDashboard();
  showToast('Trip deleted');
}

function openManualForm() {
  const drawer = document.getElementById('tripDrawer');
  if (drawer) drawer.classList.remove('hidden');
}

function closeManualForm() {
  const drawer = document.getElementById('tripDrawer');
  if (drawer) drawer.classList.add('hidden');
}

function handleManualTripSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const trip = {
    id: 'R-' + Math.floor(Date.now() / 1000),
    name: (formData.get('name') || '').toString().trim(),
    phone: (formData.get('phone') || '').toString().trim(),
    pickup: (formData.get('pickup') || '').toString().trim(),
    destination: (formData.get('destination') || '').toString().trim(),
    date: (formData.get('date') || '').toString(),
    carType: (formData.get('carType') || '').toString(),
    status: (formData.get('status') || 'upcoming').toString(),
    notes: (formData.get('notes') || '').toString().trim(),
    source: 'manual',
  };

  if (!trip.name || !trip.phone || !trip.pickup || !trip.destination || !trip.date || !trip.carType) {
    showToast('Please fill all details');
    return;
  }

  const trips = getTrips();
  trips.push(trip);
  saveTrips(trips);
  form.reset();
  closeManualForm();
  renderDashboard();
  showToast('Trip saved');
}

function bindDashboardEvents() {
  const addTripButton = document.getElementById('addTripButton');
  const closeDrawer = document.getElementById('closeDrawer');
  const logoutButton = document.getElementById('logoutButton');
  const rideSearch = document.getElementById('rideSearch');
  const manualTripForm = document.getElementById('manualTripForm');

  if (addTripButton) addTripButton.addEventListener('click', openManualForm);
  if (closeDrawer) closeDrawer.addEventListener('click', closeManualForm);
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      window.location.href = 'dashboard-login.html';
    });
  }
  if (rideSearch) {
    rideSearch.addEventListener('input', renderDashboard);
  }
  if (manualTripForm) {
    manualTripForm.addEventListener('submit', handleManualTripSubmit);
  }

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
      renderDashboard();
    });
  });

  document.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;
    const tripId = actionBtn.dataset.id;
    const action = actionBtn.dataset.action;

    if (action === 'status') {
      updateTripStatus(tripId, actionBtn.dataset.status);
    }

    if (action === 'call') {
      const trip = getTrips().find((item) => item.id === tripId);
      if (trip) {
        window.location.href = `tel:${trip.phone}`;
      }
    }

    if (action === 'delete') {
      const trip = getTrips().find((item) => item.id === tripId);
      if (trip && window.confirm(`Delete the ride for ${trip.name}?`)) {
        deleteTrip(tripId);
      }
    }
  });
}

getTrips();

if (window.location.pathname.endsWith('dashboard.html')) {
  localStorage.removeItem('sn_driver_session');
  window.location.replace('dashboard-login.html');
}

const phoneInput = document.querySelector('input[name="phone"]');
if (phoneInput) {
  phoneInput.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 10);
  });
}
