const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/slots/:washId', getAvailableSlots);
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.put('/:id/status', protect, authorize('provider'), updateBookingStatus);
router.delete('/:id', protect, authorize('customer'), cancelBooking);

module.exports = router;
