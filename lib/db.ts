import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;
let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    // Use real MongoDB Atlas connection if URI is provided, otherwise fallback to in-memory
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (MONGODB_URI) {
      // Connect to real MongoDB Atlas
      await mongoose.connect(MONGODB_URI, {
        dbName: 'farmerkyc',
      });
      
      isConnected = true;
      console.log('✅ MongoDB Atlas connected');
    } else {
      // Fallback to in-memory MongoDB for development
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      
      const uri = mongod.getUri();
      
      await mongoose.connect(uri, {
        dbName: 'farmerkyc',
      });

      isConnected = true;
      console.log('✅ MongoDB connected (In-Memory - Development Mode)');
      console.log('⚠️  Note: Set MONGODB_URI environment variable to use MongoDB Atlas');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  }
}

// Helper to get connection status
export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Ensure connection before using models
export async function ensureConnection() {
  if (!isDBConnected()) {
    await connectDB();
  }
}

