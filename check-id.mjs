import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env" });

const uri = process.env.DATABASE_URL;
const id = "69e7a36fc88018336425e52e";

async function check() {
  try {
    await mongoose.connect(uri);
    const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({ name: String }));
    const cat = await Category.findById(id);
    if (cat) {
      console.log("Category found:", cat);
    } else {
      console.log("Category not found");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

check();
