const User = require('../models/User');
const CarWash = require('../models/CarWash');
const Service = require('../models/Service');

/**
 * Idempotent initialization of the Default / Demo Centre and its sample packages.
 * Ensures that on any server startup or restart:
 * 1. The default demo center exists exactly once.
 * 2. Its demo packages exist without duplicate creation.
 * 3. Existing centers (like RajCarWash) are never overwritten or deleted.
 */
async function initDefaultCentre() {
  try {
    // 1. Ensure a designated default system provider account exists
    let defaultOwner = await User.findOne({ email: 'default.centre@carwash.com' });
    if (!defaultOwner) {
      defaultOwner = await User.create({
        name: 'CarWash Connect Demo Host',
        email: 'default.centre@carwash.com',
        password: 'demo_secure_pass_' + Date.now(),
        phone: '1800-000-DEMO',
        role: 'provider'
      });
      console.log('[Default Centre]: Created system demo provider account.');
    }

    // 2. Find or create the "CarWash Connect Default Centre"
    const DEFAULT_CENTRE_NAME = 'CarWash Connect Default Centre';
    let defaultCentre = await CarWash.findOne({ name: DEFAULT_CENTRE_NAME });

    if (!defaultCentre) {
      defaultCentre = await CarWash.create({
        ownerId: defaultOwner._id,
        name: DEFAULT_CENTRE_NAME,
        address: 'Service Hub Alpha (Placeholder Address), Maharashtra',
        latitude: 20.9042, // Reference coordinates (Dhule central crossroads)
        longitude: 74.7749,
        phone: '1800-000-DEMO (Demo Helpline)',
        email: 'default.centre@carwash.com',
        city: 'Dhule',
        district: 'Dhule',
        state: 'Maharashtra',
        country: 'India',
        description: 'Demonstration and sample booking car wash center for platform testing. Clearly identified placeholder information for viva and evaluation purposes.',
        openingTime: '08:00',
        closingTime: '20:00',
        slotDurationMinutes: 60,
        capacityPerSlot: 2,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true,
        isDefault: true
      });
      console.log('[Default Centre]: Created "CarWash Connect Default Centre" successfully.');
    } else {
      // Ensure the isDefault flag and operational fields are set
      let needsSave = false;
      if (!defaultCentre.isDefault) {
        defaultCentre.isDefault = true;
        needsSave = true;
      }
      if (!defaultCentre.city) {
        defaultCentre.city = 'Dhule';
        defaultCentre.district = 'Dhule';
        defaultCentre.state = 'Maharashtra';
        defaultCentre.country = 'India';
        needsSave = true;
      }
      if (defaultCentre.isActive === undefined || defaultCentre.isActive === null) {
        defaultCentre.isActive = true;
        needsSave = true;
      }
      if (needsSave) {
        await defaultCentre.save();
      }
    }

    // 3. Ensure Default Demo Service Packages exist idempotently
    const demoPackages = [
      {
        serviceName: 'Basic Wash (Demo)',
        description: 'Exterior body high-pressure wash and basic tire cleaning.',
        price: 250,
        estimatedDuration: '30 mins',
        includedServices: ['Exterior high-pressure wash', 'Basic body cleaning', 'Microfiber towel dry'],
        isActive: true
      },
      {
        serviceName: 'Standard Wash (Demo)',
        description: 'Exterior foam wash, interior cabin vacuuming, and dashboard cleaning.',
        price: 450,
        estimatedDuration: '45 mins',
        includedServices: ['Exterior foam wash', 'Interior vacuuming', 'Dashboard wiping & cleaning', 'Tire dressing'],
        isActive: true
      },
      {
        serviceName: 'Premium Wash (Demo)',
        description: 'Standard wash services plus hydrophobic paint polish and AC cabin sanitization.',
        price: 750,
        estimatedDuration: '60 mins',
        includedServices: ['Standard wash services', 'Additional paint polish & detailing', 'AC vent fragrance disinfection', 'Underchassis pressure clean'],
        isActive: true
      }
    ];

    for (const pkg of demoPackages) {
      const existingPkg = await Service.findOne({
        washId: defaultCentre._id,
        serviceName: pkg.serviceName
      });

      if (!existingPkg) {
        await Service.create({
          washId: defaultCentre._id,
          serviceName: pkg.serviceName,
          description: pkg.description,
          price: pkg.price,
          estimatedDuration: pkg.estimatedDuration,
          includedServices: pkg.includedServices,
          isActive: pkg.isActive
        });
        console.log(`[Default Centre]: Seeded demo package "${pkg.serviceName}".`);
      }
    }

    return defaultCentre;
  } catch (err) {
    console.error('[Default Centre Init Error]:', err.message);
  }
}

module.exports = { initDefaultCentre };
