const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    washId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarWash',
      required: true
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true
    },
    description: {
      type: String,
      default: 'Comprehensive wash and detailing service.'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative']
    },
    estimatedDuration: {
      type: String,
      default: '45 mins'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Service', serviceSchema);
