import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (isConnected) return mongoose.connection;

  await mongoose.connect(uri);
  isConnected = true;

  return mongoose.connection;
}

export async function disconnectMongo() {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
}
