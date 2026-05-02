import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AdminModel = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function resetAdmin() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not set in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const email = "admin@brutalburger.com";
    const password = adminPassword;
    const passwordHash = await bcrypt.hash(password, 12); // Increased salt rounds for security

    const result = await AdminModel.findOneAndUpdate(
      { email },
      { 
        $set: { 
          passwordHash,
          name: "Admin" 
        } 
      },
      { upsert: true, new: true }
    );

    console.log(`Admin user reset/created: ${result.email}`);
    console.log("Password updated successfully (not logged for security)");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error resetting admin:", err);
    process.exit(1);
  }
}

resetAdmin();
