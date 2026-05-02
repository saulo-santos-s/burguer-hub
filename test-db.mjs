import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error("DATABASE_URL not set in environment variables");
  process.exit(1);
}

async function test() {
  try {
    console.log("Testing connection to:", uri.replace(/:.*@/, ":****@"));
    await mongoose.connect(uri);
    console.log("Connection successful!");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

test();
