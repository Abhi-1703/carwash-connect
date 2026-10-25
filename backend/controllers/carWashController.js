const CarWash = require('../models/CarWash');
const Service = require('../models/Service');
const { calculateDistance } = require('../utils/distance');

// @desc    Get nearby car washes based on customer latitude & longitude
// @route   GET /api/carwashes/nearby?lat=...&lng=...&maxDistance=...
// @access  Public
exports.getNearbyCarWashes = async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and Longitude query parameters are required to find nearby car washes.'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDist = maxDistance ? parseFloat(maxDistance) : 60; // default 60 km radius
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50; // allow caller to limit, defaults to up to 50

    const allCarWashes = await CarWash.find().lean();

    // Deduplicate by string ID just in case
    const seenIds = new Set();
    const uniqueWashes = allCarWashes.filter(w => {
      const idStr = w._id.toString();
      if (seenIds.has(idStr)) return false;
      seenIds.add(idStr);
      return true;
    });

    // Attach distance and services to each car wash
    const carWashesWithDistance = await Promise.all(
      uniqueWashes.map(async (wash) => {
        const distance = calculateDistance(userLat, userLng, wash.latitude, wash.longitude);
        const services = await Service.find({ washId: wash._id, isActive: { $ne: false } }).lean();
        return {
          ...wash,
          distance, // distance in km
          services
        };
      })
    );

    // Filter by max distance and sort by nearest to farthest
    const nearby = carWashesWithDistance
      .filter((wash) => wash.distance !== null && wash.distance <= maxDist)
      .sort((a, b) => a.distance - b.distance);

    const limitedResults = nearby.slice(0, limit);

    res.status(200).json({
      success: true,
      totalCount: nearby.length,
      count: limitedResults.length,
      userLocation: { latitude: userLat, longitude: userLng },
      carWashes: limitedResults
    });
  } catch (error) {
    console.error('Nearby error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for nearby car washes: ' + error.message
    });
  }
};

// @desc    Get all car washes
// @route   GET /api/carwashes
// @access  Public
exports.getAllCarWashes = async (req, res) => {
  try {
    const carWashes = await CarWash.find().populate('ownerId', 'name email phone');
    res.status(200).json({
      success: true,
      count: carWashes.length,
      carWashes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single car wash by ID with its services
// @route   GET /api/carwashes/:id
// @access  Public
exports.getCarWashById = async (req, res) => {
  try {
    const wash = await CarWash.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash center not found.' });
    }

    const serviceFilter = { washId: wash._id };
    if (req.query.includeInactive !== 'true') {
      serviceFilter.isActive = { $ne: false };
    }
    const services = await Service.find(serviceFilter);

    res.status(200).json({
      success: true,
      carWash: wash,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current provider's car wash
// @route   GET /api/carwashes/provider/my
// @access  Private (Provider only)
exports.getMyCarWash = async (req, res) => {
  try {
    const wash = await CarWash.findOne({ ownerId: req.user._id });
    if (!wash) {
      return res.status(200).json({ success: true, carWash: null });
    }

    const services = await Service.find({ washId: wash._id });
    res.status(200).json({
      success: true,
      carWash: wash,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update car wash center
// @route   POST /api/carwashes
// @access  Private (Provider only)
exports.createCarWash = async (req, res) => {
  try {
    const { name, address, latitude, longitude, phone, description, openingTime, closingTime, slotDurationMinutes, capacityPerSlot, imageUrl } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, latitude, longitude, and phone are required.'
      });
    }

    // Check if provider already has a car wash registered
    let wash = await CarWash.findOne({ ownerId: req.user._id });

    if (wash) {
      // Update existing
      wash = await CarWash.findByIdAndUpdate(
        wash._id,
        {
          name,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          phone,
          description: description || wash.description,
          openingTime: openingTime || wash.openingTime,
          closingTime: closingTime || wash.closingTime,
          slotDurationMinutes: slotDurationMinutes ? parseInt(slotDurationMinutes) : wash.slotDurationMinutes,
          capacityPerSlot: capacityPerSlot ? parseInt(capacityPerSlot) : wash.capacityPerSlot,
          imageUrl: imageUrl || wash.imageUrl
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Car wash details updated successfully!',
        carWash: wash
      });
    }

    // Create new
    wash = await CarWash.create({
      ownerId: req.user._id,
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      phone,
      description,
      openingTime: openingTime || '09:00',
      closingTime: closingTime || '18:00',
      slotDurationMinutes: slotDurationMinutes ? parseInt(slotDurationMinutes) : 60,
      capacityPerSlot: capacityPerSlot ? parseInt(capacityPerSlot) : 1,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
    });

    res.status(201).json({
      success: true,
      message: 'Car wash registered successfully!',
      carWash: wash
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update specific car wash by ID
// @route   PUT /api/carwashes/:id
// @access  Private (Provider owner only)
exports.updateCarWash = async (req, res) => {
  try {
    let wash = await CarWash.findById(req.params.id);

    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash not found' });
    }

    // Ensure only the center owner can update
    if (wash.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own car wash center.'
      });
    }

    wash = await CarWash.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Car wash updated successfully!',
      carWash: wash
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete car wash by ID
// @route   DELETE /api/carwashes/:id
// @access  Private (Provider owner only)
exports.deleteCarWash = async (req, res) => {
  try {
    const wash = await CarWash.findById(req.params.id);

    if (!wash) {
      return res.status(404).json({ success: false, message: 'Car wash not found' });
    }

    if (wash.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own car wash center.'
      });
    }

    await Service.deleteMany({ washId: wash._id });
    await wash.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car wash center and its services removed successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
