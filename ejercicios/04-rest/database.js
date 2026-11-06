import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (typeof uri !== 'string' || !/^mongodb(?:\+srv)?:\/\//.test(uri)) throw new Error('Configurá MONGODB_URI con una base de práctica propia');
  return mongoose.createConnection(uri, { serverSelectionTimeoutMS: 10000 }).asPromise();
}
