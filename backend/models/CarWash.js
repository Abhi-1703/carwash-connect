const mongoose = require('mongoose');

const carWashSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide the car wash center name'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please provide the physical address'],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required for location mapping']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required for location mapping']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    description: {
      type: String,
      default: 'Professional automobile cleaning and detailing services.'
    },
    openingTime: {
      type: String,
      default: '09:00'
    },
    closingTime: {
      type: String,
      default: '18:00'
    },
    slotDurationMinutes: {
      type: Number,
      default: 60
    },
    capacityPerSlot: {
      type: Number,
      default: 1
    },
    rating: {
      type: Number,
      default: 4.8
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CarWash', carWashSchema);
