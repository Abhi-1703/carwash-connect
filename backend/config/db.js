const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carwash_connect';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('[MongoDB Connected]: ' + conn.connection.host);

    // Idempotent initialization of default centre & demo packages
    try {
      const { initDefaultCentre } = require('../utils/initDefaultCentre');
      await initDefaultCentre();
    } catch (initErr) {
      console.warn('[Notice]: Default Centre initialization notice:', initErr.message);
    }
  } catch (error) {
    console.warn('[MongoDB Notice]: Could not connect to ' + mongoUri + ' (' + error.message + ')');
    console.log('To connect: Start local MongoDB service or set a free MongoDB Atlas URI in backend/.env');
  }
};

module.exports = connectDB;