const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const CarWash = require('../models/CarWash');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carwash_connect';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB at', mongoUri);

    // Clear existing collections
    await User.deleteMany({});
    await CarWash.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    console.log('[Seed]: Cleared existing database records.');

    // 1. Create Sample Customer
    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@gmail.com',
      password: 'password123',
      phone: '9876543210',
      role: 'customer',
      latitude: 18.5204,
      longitude: 73.8567
    });

    // 2. Create Sample Providers
    const provider1 = await User.create({
      name: 'Amit Patel',
      email: 'provider1@carwash.com',
      password: 'password123',
      phone: '9822011223',
      role: 'provider'
    });

    const provider2 = await User.create({
      name: 'Vikram Joshi',
      email: 'provider2@carwash.com',
      password: 'password123',
      phone: '9822033445',
      role: 'provider'
    });

    const provider3 = await User.create({
      name: 'Sneha Kulkarni',
      email: 'provider3@carwash.com',
      password: 'password123',
      phone: '9822055667',
      role: 'provider'
    });

    // 3. Create Sample Car Wash Centers
    const wash1 = await CarWash.create({
      ownerId: provider1._id,
      name: 'Sparkle Auto Spa & Wash',
      address: 'Shop 12, FC Road, Shivaji Nagar, Pune',
      latitude: 18.5204,
      longitude: 73.8567,
      phone: '020-25531234',
      description: 'Top-rated car spa specializing in foam washing, deep interior vacuuming, and hydrophobic wax.',
      openingTime: '09:00',
      closingTime: '18:00',
      slotDurationMinutes: 60,
      capacityPerSlot: 1,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
    });

    const wash2 = await CarWash.create({
      ownerId: provider2._id,
      name: 'Speedy Wheels Express Wash',
      address: 'Plot 45, Model Colony, Pune',
      latitude: 18.5312,
      longitude: 73.8445,
      phone: '020-25654321',
      description: 'Quick exterior pressure cleaning and underbody jet wash with fast turnaround time.',
      openingTime: '08:00',
      closingTime: '19:00',
      slotDurationMinutes: 60,
      capacityPerSlot: 1,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80'
    });

    const wash3 = await CarWash.create({
      ownerId: provider3._id,
      name: 'EcoShine Green Car Care',
      address: 'Kalyani Nagar Main Road, Pune',
      latitude: 18.5520,
      longitude: 73.8820,
      phone: '020-26639988',
      description: '100% eco-friendly waterless steam wash, organic wax, and ozone cabin sanitization.',
      openingTime: '09:00',
      closingTime: '18:00',
      slotDurationMinutes: 60,
      capacityPerSlot: 1,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80'
    });

    // 4. Create Services for Wash 1
    const service1 = await Service.create({
      washId: wash1._id,
      serviceName: 'Basic Exterior Wash',
      description: 'High-pressure water rinse, shampoo foam cannon wash, tire dressing, and micro-fiber drying.',
      price: 250,
      estimatedDuration: '30 mins'
    });

    await Service.create({
      washId: wash1._id,
      serviceName: 'Premium Foam & Wax',
      description: 'Includes exterior wash, wheel rim scrubbing, hand wax polish, and glass streak-free shine.',
      price: 450,
      estimatedDuration: '45 mins'
    });

    await Service.create({
      washId: wash1._id,
      serviceName: 'Complete Interior & Exterior Spa',
      description: 'Deep vacuuming of seats, floor mats, boot space, dashboard polish, and AC vent fragrance treatment.',
      price: 799,
      estimatedDuration: '75 mins'
    });

    // 5. Create Services for Wash 2
    await Service.create({
      washId: wash2._id,
      serviceName: 'Express Pressure Clean',
      description: 'Quick 20-minute exterior power-jet wash for busy commuters.',
      price: 200,
      estimatedDuration: '20 mins'
    });

    await Service.create({
      washId: wash2._id,
      serviceName: 'Underbody Jet Wash & Engine Bay',
      description: 'High-pressure underchassis mud removal and de-greasing of engine compartment.',
      price: 350,
      estimatedDuration: '40 mins'
    });

    // 6. Create Services for Wash 3
    await Service.create({
      washId: wash3._id,
      serviceName: 'Eco Steam Wash',
      description: 'High temperature chemical-free steam cleaning saving 90% water.',
      price: 300,
      estimatedDuration: '35 mins'
    });

    await Service.create({
      washId: wash3._id,
      serviceName: 'Ozone Cabin Sanitization',
      description: 'Kills 99.9% airborne bacteria and eliminates stubborn interior smells.',
      price: 500,
      estimatedDuration: '40 mins'
    });

    // 7. Create a Sample Booking to Demonstrate Booked Slots
    const today = new Date().toISOString().split('T')[0];
    await Booking.create({
      userId: customer._id,
      washId: wash1._id,
      serviceId: service1._id,
      date: today,
      time: '11:00 AM',
      vehicleNumber: 'MH12 AB 9988',
      vehicleType: 'Sedan',
      totalPrice: service1.price,
      status: 'Confirmed'
    });

    console.log('[Seed]: Successfully inserted sample data!');
    console.log('====================================================');
    console.log('Sample Customer Credentials:');
    console.log('  Email: customer@gmail.com | Password: password123');
    console.log('Sample Provider Credentials:');
    console.log('  Email: provider1@carwash.com | Password: password123');
    console.log('  Email: provider2@carwash.com | Password: password123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
