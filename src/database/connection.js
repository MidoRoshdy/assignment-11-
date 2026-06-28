import { env } from "../../config/env.service.js";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err.message);
    process.exit(1);
  }
};
