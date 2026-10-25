const Service = require('../models/Service');
const CarWash = require('../models/CarWash');

// @desc    Get all services for a specific car wash
// @route   GET /api/services/wash/:washId
// @access  Public
exports.getServicesByWashId = async (req, res) => {
  try {
    const filter = { washId: req.params.washId };
    // By default, for public/customer views, show only active packages unless includeInactive=true
    if (req.query.includeInactive !== 'true') {
      filter.isActive = { $ne: false };
    }

    const services = await Service.find(filter);
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new service package for a car wash
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
  try {
    const { washId, serviceName, description, price, estimatedDuration, includedServices, isActive } = req.body;

    if (!washId || !serviceName || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Wash ID, service name, and price are required.'
      });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid non-negative price in INR is required.'
      });
    }

    const wash = await CarWash.findById(washId);
    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash center not found.' });
    }

    // Verify ownership or admin
    if (wash.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only add services to your own car wash center.'
      });
    }

    let parsedIncluded = [];
    if (Array.isArray(includedServices)) {
      parsedIncluded = includedServices.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof includedServices === 'string' && includedServices.trim()) {
      parsedIncluded = includedServices.split(',').map(s => s.trim()).filter(Boolean);
    }

    const service = await Service.create({
      washId,
      serviceName: serviceName.trim(),
      description: description ? description.trim() : 'Comprehensive wash and detailing service.',
      price: numericPrice,
      estimatedDuration: estimatedDuration ? estimatedDuration.trim() : '45 mins',
      includedServices: parsedIncluded,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    res.status(201).json({
      success: true,
      message: 'Service package added successfully!',
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a service package
// @route   PUT /api/services/:id
// @access  Private (Provider owner or Admin)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service package not found' });
    }

    const wash = await CarWash.findById(service.washId);
    if (!wash || (wash.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit services of your own car wash center.'
      });
    }

    const updates = {};
    if (req.body.serviceName !== undefined) updates.serviceName = req.body.serviceName.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.price !== undefined) {
      const p = parseFloat(req.body.price);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ success: false, message: 'Valid non-negative price in INR is required.' });
      }
      updates.price = p;
    }
    if (req.body.estimatedDuration !== undefined) updates.estimatedDuration = req.body.estimatedDuration.trim();
    if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);
    if (req.body.includedServices !== undefined) {
      if (Array.isArray(req.body.includedServices)) {
        updates.includedServices = req.body.includedServices.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof req.body.includedServices === 'string') {
        updates.includedServices = req.body.includedServices.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    service = await Service.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Service package updated successfully!',
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete or deactivate a service package
// @route   DELETE /api/services/:id
// @access  Private (Provider owner or Admin)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service package not found' });
    }

    const wash = await CarWash.findById(service.washId);
    if (!wash || (wash.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete services of your own car wash center.'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service package deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
