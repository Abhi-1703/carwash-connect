const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    washId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarWash',
      required: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Booking date is required']
    },
    time: {
      type: String, // Format: 09:00 AM, 11:00 AM, etc.
      required: [true, 'Time slot is required']
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: 'Not Specified'
    },
    vehicleType: {
      type: String,
      enum: ['Hatchback', 'Sedan', 'SUV', 'Bike', 'Other'],
      default: 'Sedan'
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    serviceLocation: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help query bookings quickly for a specific wash and date
bookingSchema.index({ washId: 1, date: 1, time: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
