import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export async function connectDB({ allowMemoryFallback = true } = {}) {
  const configuredUri = process.env.MONGO_URI;
  const uri = configuredUri || 'mongodb://127.0.0.1:27017/hdss';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected.');
  } catch (error) {
    const isLocalUri = /^mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::|\/)/i.test(uri);
    const allowRemoteFallback = process.env.NODE_ENV !== 'production'
      && process.env.ALLOW_MEMORY_FALLBACK === 'true';
    if (!allowMemoryFallback || process.env.NODE_ENV === 'production' || (configuredUri && !isLocalUri && !allowRemoteFallback)) {
      throw error;
    }

    memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'hdss' } });
    await mongoose.connect(memoryServer.getUri());
    console.log('MongoDB connected using in-memory demo server');
  }
}
