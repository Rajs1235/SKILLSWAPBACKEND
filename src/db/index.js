import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectioninstance = await mongoose.connect(process.env.MONGODB_URI
    
    );

    console.log(`MongoDB connected host: ${connectioninstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;