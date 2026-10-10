const Booking = require('../models/Booking');
const CarWash = require('../models/CarWash');
const Service = require('../models/Service');

// Helper to convert 24hr string into formatted 12hr slot string ("09:00 AM")
function formatTime12Hr(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? '0' + minutes : String(minutes);
  const padHours = displayHours < 10 ? '0' + displayHours : String(displayHours);
  return padHours + ':' + displayMinutes + ' ' + ampm;
}

// Parse "HH:MM" (24h) to total minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 9 * 60;
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}

// @desc    Get dynamic time slots and their availability for a wash and date
// @route   GET /api/bookings/slots/:washId?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { washId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required.'
      });
    }

    const wash = await CarWash.findById(washId);
    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash center not found.' });
    }

    const openMin = parseTimeToMinutes(wash.openingTime || '09:00');
    const closeMin = parseTimeToMinutes(wash.closingTime || '18:00');
    const duration = wash.slotDurationMinutes || 60;
    const capacity = wash.capacityPerSlot || 1;

    // Generate standard time slots between opening and closing time
    const slotTimes = [];
    for (let current = openMin; current + duration <= closeMin; current += duration) {
      slotTimes.push(formatTime12Hr(current));
    }

    // Fetch existing active bookings for this center on this date
    const bookedRecords = await Booking.find({
      washId,
      date,
      status: { "$nin": ['Cancelled', 'Rejected'] }
    }).select('time');

    // Count how many times each slot is booked
    const slotCounts = {};
    bookedRecords.forEach((b) => {
      slotCounts[b.time] = (slotCounts[b.time] || 0) + 1;
    });

    // Determine availability for each slot
    const slots = slotTimes.map((time) => {
      const booked = slotCounts[time] || 0;
      const isAvailable = booked < capacity;
      return {
        time,
        isAvailable,
        bookedCount: booked,
        capacity
      };
    });

    res.status(200).json({
      success: true,
      washId,
      washName: wash.name,
      date,
      slots
    });
  } catch (error) {
    console.error('Slot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new car wash booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    const { washId, serviceId, date, time, vehicleNumber, vehicleType } = req.body;

    if (!washId || !serviceId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Car wash, service, date, and time slot are required.'
      });
    }

    // 1. Verify Car Wash exists
    const wash = await CarWash.findById(washId);
    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash center not found.' });
    }

    // 2. Verify Service exists and belongs to this car wash
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Selected service not found.' });
    }

    if (service.washId.toString() !== washId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Selected service does not belong to this car wash.'
      });
    }

    // 3. Backend Conflict Check: prevent double-booking for the exact same slot
    const existingActiveBookings = await Booking.countDocuments({
      washId,
      date,
      time,
      status: { "$nin": ['Cancelled', 'Rejected'] }
    });

    const capacity = wash.capacityPerSlot || 1;
    if (existingActiveBookings >= capacity) {
      return res.status(400).json({
        success: false,
        message: 'The ' + time + ' slot on ' + date + ' has just been booked. Please choose another available slot.'
      });
    }

    // 4. Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      washId,
      serviceId,
      date,
      time,
      vehicleNumber: vehicleNumber || 'Not Specified',
      vehicleType: vehicleType || 'Sedan',
      totalPrice: service.price,
      status: 'Pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('washId', 'name address phone')
      .populate('serviceId', 'serviceName price estimatedDuration')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current customer bookings
// @route   GET /api/bookings/my
// @access  Private (Customer)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('washId', 'name address phone latitude longitude')
      .populate('serviceId', 'serviceName price estimatedDuration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get provider car wash bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider only)
exports.getProviderBookings = async (req, res) => {
  try {
    const wash = await CarWash.findOne({ ownerId: req.user._id });
    if (!wash) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: []
      });
    }

    const bookings = await Booking.find({ washId: wash._id })
      .populate('userId', 'name email phone')
      .populate('serviceId', 'serviceName price estimatedDuration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Provider updates booking status (Confirmed, Rejected, Completed)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ['Confirmed', 'Rejected', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify provider owns this car wash
    const wash = await CarWash.findById(booking.washId);
    if (!wash || wash.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update bookings for your own car wash center.'
      });
    }

    booking.status = status;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking has been marked as ' + status + '!',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer cancels booking
// @route   DELETE /api/bookings/:id
// @access  Private (Customer)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify booking belongs to this customer
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only cancel your own bookings.'
      });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled.'
      });
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by customer';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};