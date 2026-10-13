import mongoose from 'mongoose';

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kurtikatha';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database Error] Connection failed: ${err.message}`);
    // Do not crash server in dev so health check and mocking work
    return null;
  }
}
