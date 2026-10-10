const Service = require('../models/Service');
const CarWash = require('../models/CarWash');

// @desc    Get all services for a specific car wash
// @route   GET /api/services/wash/:washId
// @access  Public
exports.getServicesByWashId = async (req, res) => {
  try {
    const services = await Service.find({ washId: req.params.washId });
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new service for a car wash
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
  try {
    const { washId, serviceName, description, price, estimatedDuration } = req.body;

    if (!washId || !serviceName || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Wash ID, service name, and price are required.'
      });
    }

    const wash = await CarWash.findById(washId);
    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash center not found.' });
    }

    // Verify ownership
    if (wash.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only add services to your own car wash center.'
      });
    }

    const service = await Service.create({
      washId,
      serviceName,
      description,
      price: parseFloat(price),
      estimatedDuration: estimatedDuration || '45 mins'
    });

    res.status(201).json({
      success: true,
      message: 'Service added successfully!',
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const wash = await CarWash.findById(service.washId);
    if (!wash || wash.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit services of your own car wash center.'
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully!',
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const wash = await CarWash.findById(service.washId);
    if (!wash || wash.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete services of your own car wash center.'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
