import mongoose from "mongoose";
import * as schema from "./mongodb";

const MONGODB_URI = process.env.DATABASE_URL;

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  if (!MONGODB_URI) {
    console.log("No DATABASE_URL found. Running without MongoDB (Development mode).");
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error instanceof Error ? error.message : String(error));
    console.log("Proceeding without MongoDB...");
  }
}

// Export Mongoose models
export const { AdminModel, CategoryModel, ProductModel } = schema;

// Mocking 'db' for compatibility with existing code if needed, 
// but we'll migrate to use Models directly.
export const db = null as any; 

export * from "./mongodb";

