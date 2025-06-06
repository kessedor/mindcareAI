import mongoose from 'mongoose';
import { logger } from './logger.js';

const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare-ai';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info('✅ Database connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Database reconnected');
    });

  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

export { connectDatabase, disconnectDatabase };