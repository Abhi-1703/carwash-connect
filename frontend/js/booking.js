// Booking Flow Engine with Integrated Location Support

let currentWash = null;
let selectedService = null;
let selectedSlotTime = null;
let selectedLocationName = '';

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  if (!isLoggedIn()) {
    alert('Please log in as a customer to book a car wash service.');
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const washId = urlParams.get('washId');
  const serviceId = urlParams.get('serviceId');

  if (!washId) {
    alert('No car wash selected. Redirecting to centers list...');
    window.location.href = 'nearby.html';
    return;
  }

  // Setup Date input: Min today, default today
  const dateInput = document.getElementById('booking-date');
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.min = todayStr;
    dateInput.value = todayStr;
    dateInput.addEventListener('change', () => loadSlots(washId, dateInput.value));
  }

  // Load Car Wash & Services
  await loadWashDetails(washId, serviceId);

  // Initialize Location Selection
  initBookingLocationDropdown();

  // Load initial slots for today
  if (dateInput) {
    loadSlots(washId, dateInput.value);
  }

  // Booking Form Submission
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }
});

function initBookingLocationDropdown() {
  const locSelect = document.getElementById('booking-location-select');
  if (!locSelect) return;

  locSelect.innerHTML = '<option value="">-- Choose Service Area / Pick-up Location * --</option>';

  // 1. Center's own physical workshop address
  if (currentWash) {
    const centerOpt = document.createElement('option');
    centerOpt.value = `${currentWash.name} (Workshop: ${currentWash.address})`;
    centerOpt.textContent = `🏢 Center Workshop: ${currentWash.address}`;
    locSelect.appendChild(centerOpt);
  }

  // 2. Add Multi-Region Service Areas (Dhule / Khandesh + Shirdi)
  const allLocations = typeof getAllLocations === 'function' ? getAllLocations() : (typeof getShirdiLocations === 'function' ? getShirdiLocations() : []);
  if (allLocations.length > 0) {
    const dhuleGroup = document.createElement('optgroup');
    dhuleGroup.label = '📍 Dhule & Khandesh Service Areas (8 Towns)';

    const shirdiGroup = document.createElement('optgroup');
    shirdiGroup.label = '📍 Shirdi & Vicinity Service Areas (7 Areas)';

    allLocations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = `${loc.name}, ${loc.area}`;
      opt.textContent = `${loc.icon} ${loc.name} (${loc.pincode})`;

      if (loc.regionId === 'dhule-region') {
        dhuleGroup.appendChild(opt);
      } else {
        shirdiGroup.appendChild(opt);
      }
    });

    if (dhuleGroup.children.length > 0) locSelect.appendChild(dhuleGroup);
    if (shirdiGroup.children.length > 0) locSelect.appendChild(shirdiGroup);
  }

  // Check if a location was previously selected on nearby.html
  const savedLoc = typeof getSavedServiceLocation === 'function' ? getSavedServiceLocation() : null;
  if (savedLoc) {
    const matchingVal = `${savedLoc.name}, ${savedLoc.area}`;
    for (let i = 0; i < locSelect.options.length; i++) {
      if (locSelect.options[i].value === matchingVal) {
        locSelect.selectedIndex = i;
        selectedLocationName = matchingVal;
        break;
      }
    }
  }

  if (!selectedLocationName && currentWash) {
    // Default to workshop location if nothing pre-selected
    selectedLocationName = `${currentWash.name} (Workshop: ${currentWash.address})`;
    locSelect.selectedIndex = 1;
  }

  locSelect.addEventListener('change', (e) => {
    selectedLocationName = e.target.value;
    updateSummary();
  });

  updateSummary();
}

async function loadWashDetails(washId, preselectedServiceId) {
  try {
    const data = await apiFetch(`/carwashes/${washId}`);
    currentWash = data.carWash;
    const services = data.services || [];

    // Fill UI
    document.getElementById('wash-name').textContent = currentWash.name;
    document.getElementById('wash-address').textContent = '📍 ' + currentWash.address;
    document.getElementById('wash-timing').textContent = `🕒 Hours: ${currentWash.openingTime} - ${currentWash.closingTime}`;

    // Populate service dropdown
    const serviceSelect = document.getElementById('service-select');
    serviceSelect.innerHTML = '<option value="">-- Choose a Service Package --</option>';

    services.forEach(s => {
      const option = document.createElement('option');
      option.value = s._id;
      option.textContent = `${s.serviceName} - ₹${s.price} (${s.estimatedDuration || '45 mins'})`;
      option.dataset.price = s.price;
      option.dataset.name = s.serviceName;
      if (preselectedServiceId && preselectedServiceId === s._id) {
        option.selected = true;
        selectedService = s;
      }
      serviceSelect.appendChild(option);
    });

    serviceSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      if (selectedOption.value) {
        selectedService = {
          _id: selectedOption.value,
          name: selectedOption.dataset.name,
          price: parseFloat(selectedOption.dataset.price)
        };
        updateSummary();
      } else {
        selectedService = null;
        updateSummary();
      }
    });

    updateSummary();
  } catch (error) {
    alert('Failed to load car wash details: ' + error.message);
  }
}

// Fetch and render time slots
async function loadSlots(washId, date) {
  const container = document.getElementById('slots-container');
  const slotMsg = document.getElementById('slot-status-msg');
  if (!container) return;

  container.innerHTML = '<p style="grid-column:1/-1; color:#64748b;">Loading available slots...</p>';
  selectedSlotTime = null;
  updateSummary();

  try {
    const data = await apiFetch(`/bookings/slots/${washId}?date=${date}`);
    const slots = data.slots || [];

    if (slots.length === 0) {
      container.innerHTML = '<p style="grid-column:1/-1; color:#ef4444;">No slots scheduled for this date.</p>';
      return;
    }

    container.innerHTML = '';
    slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `slot-btn ${slot.isAvailable ? 'available' : 'disabled'}`;
      btn.textContent = slot.time;
      btn.disabled = !slot.isAvailable;

      if (slot.isAvailable) {
        btn.title = 'Click to select slot';
        btn.addEventListener('click', () => {
          document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlotTime = slot.time;
          updateSummary();
        });
      } else {
        btn.title = 'Slot Already Booked';
      }

      container.appendChild(btn);
    });

    if (slotMsg) {
      slotMsg.textContent = 'Select your preferred time slot from the available options below.';
    }
  } catch (error) {
    container.innerHTML = `<p style="grid-column:1/-1; color:#ef4444;">Failed to load slots: ${error.message}</p>`;
  }
}

function updateSummary() {
  const summaryService = document.getElementById('summary-service');
  const summaryLocation = document.getElementById('summary-location');
  const summarySlot = document.getElementById('summary-slot');
  const summaryTotal = document.getElementById('summary-total');

  if (summaryService) summaryService.textContent = selectedService ? selectedService.name : 'None selected';
  if (summaryLocation) summaryLocation.textContent = selectedLocationName ? selectedLocationName : 'None selected';
  if (summarySlot) summarySlot.textContent = selectedSlotTime ? selectedSlotTime : 'None selected';
  if (summaryTotal) summaryTotal.textContent = selectedService ? `₹${selectedService.price}` : '₹0';
}

async function handleBookingSubmit(e) {
  e.preventDefault();

  if (!selectedService) {
    alert('Please select a service package.');
    return;
  }

  const locSelect = document.getElementById('booking-location-select');
  const locationVal = locSelect ? locSelect.value.trim() : selectedLocationName;
  if (!locationVal) {
    alert('Please select a service area / pick-up location.');
    if (locSelect) locSelect.focus();
    return;
  }

  if (!selectedSlotTime) {
    alert('Please select an available time slot.');
    return;
  }

  const date = document.getElementById('booking-date').value;
  const vehicleNumber = document.getElementById('vehicle-number').value.trim();
  const vehicleType = document.getElementById('vehicle-type').value;

  const submitBtn = document.getElementById('submit-booking-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Securing Slot...';

  try {
    const data = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        washId: currentWash._id,
        serviceId: selectedService._id,
        date,
        time: selectedSlotTime,
        vehicleNumber,
        vehicleType,
        serviceLocation: locationVal
      })
    });

    // Show Confirmation Dialog with Location Details
    document.getElementById('booking-form-card').style.display = 'none';
    const confCard = document.getElementById('confirmation-card');
    confCard.style.display = 'block';

    document.getElementById('conf-booking-id').textContent = data.booking._id;
    document.getElementById('conf-wash-name').textContent = currentWash.name;
    document.getElementById('conf-service').textContent = selectedService.name;
    
    const confLocEl = document.getElementById('conf-location');
    if (confLocEl) {
      confLocEl.textContent = data.booking.serviceLocation || locationVal;
    }

    document.getElementById('conf-slot').textContent = `${date} at ${selectedSlotTime}`;
    document.getElementById('conf-price').textContent = `₹${data.booking.totalPrice}`;
  } catch (error) {
    alert(`Booking Error: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';
  }
}