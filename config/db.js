const mongoose = require('mongoose');
require('dotenv').config();

exports.mogodbUrlConnect = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    // Only fire logs after connection is established
    mongoose.connection.once('open', () => {
      console.log('✅ NOSQL Database connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ NOSQL Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Database connection disconnected');
    });

  } catch (error) {
    console.error('❌ NOSQL Database initial connection failed:', error);
    throw error; // Important: re-throw to let server.js decide whether to exit
  }
};
