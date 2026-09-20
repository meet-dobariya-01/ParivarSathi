import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ENV } from "./env.js";

let memoryServer;

const connectDB = async () => {
  try {
    const mongoUri = ENV.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log("Mongo connected");
  } catch (error) {
    if (ENV.NODE_ENV !== "production" && !process.env.DATABASE_URL && !process.env.MONGODB_URI) {
      try {
        memoryServer = await MongoMemoryServer.create();
        await mongoose.connect(memoryServer.getUri());
        console.log("Mongo connected");
        return;
      } catch (memoryError) {
        console.error("Mongo memory server connection error:", memoryError.message);
      }
    }

    console.error("Mongo connection error:", error.message);
    throw error;
  }
};

export default connectDB;
