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
      latitude: 20.9042,
      longitude: 74.7749
    });

    // 2. Create Sample Providers across Maharashtra Regions (Pune, Shirdi, Dhule, Shirpur, etc.)
    const providerUsers = [
      { name: 'Amit Patel', email: 'provider1@carwash.com', phone: '9822011223' },
      { name: 'Vikram Joshi', email: 'provider2@carwash.com', phone: '9822033445' },
      { name: 'Sneha Kulkarni', email: 'provider3@carwash.com', phone: '9822055667' },
      { name: 'Rajesh Patil', email: 'provider_dhule1@carwash.com', phone: '9822100001' },
      { name: 'Sachin Chaudhari', email: 'provider_dhule2@carwash.com', phone: '9822100002' },
      { name: 'Ganesh Deshmukh', email: 'provider_shirpur@carwash.com', phone: '9822100003' },
      { name: 'Nitin Ahire', email: 'provider_sakri@carwash.com', phone: '9822100004' },
      { name: 'Sunil Shinde', email: 'provider_shirdi@carwash.com', phone: '9822100005' },
      { name: 'Pravin Pawar', email: 'provider_dondaicha@carwash.com', phone: '9822100006' },
      { name: 'Dipak More', email: 'provider_shahada@carwash.com', phone: '9822100007' }
    ];

    const createdProviders = [];
    for (const p of providerUsers) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        password: 'password123',
        phone: p.phone,
        role: 'provider'
      });
      createdProviders.push(u);
    }

    // 3. Create 10 Distinct Real-World Car Wash Centers with accurate coordinates
    const centersData = [
      // --- Pune Cluster (3 Centers) ---
      {
        ownerIndex: 0,
        name: 'Sparkle Auto Spa & Wash',
        address: 'Shop 12, FC Road, Shivaji Nagar, Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        phone: '020-25531234',
        description: 'Top-rated car spa specializing in foam washing, deep interior vacuuming, and hydrophobic wax.',
        openingTime: '09:00',
        closingTime: '18:00',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
      },
      {
        ownerIndex: 1,
        name: 'Speedy Wheels Express Wash',
        address: 'Plot 45, Model Colony, Pune',
        latitude: 18.5312,
        longitude: 73.8445,
        phone: '020-25654321',
        description: 'Quick exterior pressure cleaning and underbody jet wash with fast turnaround time.',
        openingTime: '08:00',
        closingTime: '19:00',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80'
      },
      {
        ownerIndex: 2,
        name: 'EcoShine Green Car Care',
        address: 'Kalyani Nagar Main Road, Pune',
        latitude: 18.5520,
        longitude: 73.8820,
        phone: '020-26639988',
        description: '100% eco-friendly waterless steam wash, organic wax, and ozone cabin sanitization.',
        openingTime: '09:00',
        closingTime: '18:00',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80'
      },

      // --- Dhule Cluster (3 Distinct Centers) ---
      {
        ownerIndex: 3,
        name: 'Khandesh Premium Auto Detailing',
        address: 'Plot 18, Agra Road, Near Collector Office, Dhule',
        latitude: 20.9020,
        longitude: 74.7770,
        phone: '02562-234567',
        description: 'Advanced snow foam cannon wash, ceramic coating studio, and complete chassis jet wash.',
        openingTime: '08:30',
        closingTime: '20:00',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=600&q=80'
      },
      {
        ownerIndex: 4,
        name: 'Highway Speed Wash & Service',
        address: 'Opposite MIDC Gate, Mumbai-Agra Highway (NH-52), Dhule',
        latitude: 20.9180,
        longitude: 74.7890,
        phone: '02562-278910',
        description: 'Heavy duty high-pressure automated washing, wheel alignment & underbody rust proofing.',
        openingTime: '07:30',
        closingTime: '21:00',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80'
      },
      {
        ownerIndex: 3,
        name: 'Songir Express Car Care',
        address: 'Old Agra Road Junction, Songir, Dhule',
        latitude: 21.0820,
        longitude: 74.8310,
        phone: '02562-281234',
        description: 'Quick exterior steam rinse, brass polish for trims, and deep interior dry vacuuming.',
        openingTime: '08:00',
        closingTime: '19:30',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
      },

      // --- Shirpur & Northern Towns Cluster ---
      {
        ownerIndex: 5,
        name: 'Tapi Valley Auto Spa',
        address: 'Main Market Road, Near RC Patel Campus, Shirpur',
        latitude: 21.3540,
        longitude: 74.8810,
        phone: '02563-255678',
        description: 'Ultra-modern touchless jet car wash with reverse osmosis soft water and air blowing dry.',
        openingTime: '08:30',
        closingTime: '19:30',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80'
      },
      {
        ownerIndex: 6,
        name: 'Surat-Nagpur Express Wash',
        address: 'NH-53 Bypass Road, Sakri, Dhule',
        latitude: 20.9350,
        longitude: 74.3180,
        phone: '02568-242311',
        description: 'Commercial highway car wash facility specializing in highway mud cleaning and cabin sanitizing.',
        openingTime: '08:00',
        closingTime: '20:00',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        ownerIndex: 8,
        name: 'Chilly City Car Detailing',
        address: 'Station Road, Dondaicha, Dhule',
        latitude: 21.3320,
        longitude: 74.5720,
        phone: '02566-244555',
        description: 'Foam wash, teflon coating, tire dressing, and headlight restoration.',
        openingTime: '09:00',
        closingTime: '19:00',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=600&q=80'
      },

      // --- Shirdi Cluster ---
      {
        ownerIndex: 7,
        name: 'Sai Krupa Professional Car Spa',
        address: 'Pimpalwadi Road, Near Sai Baba Temple Gate 2, Shirdi',
        latitude: 19.7670,
        longitude: 74.4770,
        phone: '02423-255889',
        description: 'Dedicated pilgrim vehicle priority cleaning, rapid 25-minute dry wash, and steam interior sanitization.',
        openingTime: '07:00',
        closingTime: '21:00',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80'
      }
    ];

    const createdWashes = [];
    for (const c of centersData) {
      const owner = createdProviders[c.ownerIndex];
      const wash = await CarWash.create({
        ownerId: owner._id,
        name: c.name,
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        phone: c.phone,
        description: c.description,
        openingTime: c.openingTime,
        closingTime: c.closingTime,
        slotDurationMinutes: 60,
        capacityPerSlot: 1,
        rating: c.rating,
        imageUrl: c.imageUrl
      });
      createdWashes.push(wash);
    }

    // 4. Create Service Packages for Each Center
    for (const wash of createdWashes) {
      await Service.create({
        washId: wash._id,
        serviceName: 'Express Snow Foam Wash',
        description: 'Pressure jet rinse, snow foam bath, wheel rim scrubbing, and microfiber hand dry.',
        price: 250,
        estimatedDuration: '30 mins'
      });

      await Service.create({
        washId: wash._id,
        serviceName: 'Full Interior & Exterior Spa',
        description: 'Complete foam wash, deep carpet & seat vacuuming, dashboard polish, and AC vent disinfection.',
        price: 550,
        estimatedDuration: '50 mins'
      });

      await Service.create({
        washId: wash._id,
        serviceName: 'Ceramic Hydrophobic Wax & Polish',
        description: 'Paint gloss enhancer, UV protection wax, windshield water-repellent coating, and tire shine.',
        price: 899,
        estimatedDuration: '75 mins'
      });
    }

    // 5. Create a Sample Booking to Demonstrate Real-Time Conflict Handling
    const today = new Date().toISOString().split('T')[0];
    const firstWash = createdWashes[0];
    const firstService = await Service.findOne({ washId: firstWash._id });

    await Booking.create({
      userId: customer._id,
      washId: firstWash._id,
      serviceId: firstService._id,
      date: today,
      time: '11:00 AM',
      vehicleNumber: 'MH12 AB 9988',
      vehicleType: 'Sedan',
      serviceLocation: 'Shop 12, FC Road, Shivaji Nagar, Pune',
      totalPrice: firstService.price,
      status: 'Confirmed'
    });

    console.log(`[Seed]: Successfully created ${createdProviders.length} providers, ${createdWashes.length} distinct centers across Maharashtra!`);
    console.log('====================================================');
    console.log('Sample Customer Credentials:');
    console.log('  Email: customer@gmail.com | Password: password123');
    console.log('Sample Provider Credentials:');
    console.log('  Email: provider1@carwash.com | Password: password123');
    console.log('  Email: provider_dhule1@carwash.com | Password: password123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
