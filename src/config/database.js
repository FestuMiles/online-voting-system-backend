import mongoose from 'mongoose';
import dotenv from 'dotenv';





//Connecting to the database
//This function connects to the MongoDB database using Mongoose
//before starting the server
export const connectDB = async () => {
  try {
    await mongoose.connect(`${dotenv.config().parsed.MONGO_URI}`);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
