import mongoose, { Mongoose } from 'mongoose';

// Suppress errors during build time when MONGODB_URI is not available
const isBuildTime = !process.env.MONGODB_URI && process.env.NEXT_PHASE === 'phase-production-build';

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

// Maintain connection state in global scope during development
interface CachedMongoose {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCache: CachedMongoose;
}

let cached: CachedMongoose = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<Mongoose> {
  // Check if MongoDB URI is defined at runtime
  if (!MONGODB_URI) {
    if (isBuildTime) {
      console.warn('[Build Time] Skipping MongoDB connection - will be available at runtime');
      // Return a mock object during build to prevent errors
      return mongoose as any;
    }
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  // If connection is already cached, return it
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  // If promise is already created, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('Successfully connected to MongoDB');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    console.log('Disconnected from MongoDB');
  }
}
